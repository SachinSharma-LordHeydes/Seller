import { ProfileSetupInput } from '@/interfaces/i_graphql/IProfile';
import { AddressType, PrismaClient, Role } from '@prisma/client';
import { GraphQLContext } from '../context';
import { requireAuth, requireRole } from './auth.helpers';
import { logPerformance } from './performance';
import { invalidateCache } from './cache.helpers';

// Simple error class
class AppError extends Error {
  constructor(message: string, public code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'AppError';
  }
}

// Simple logger
const logger = {
  info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
  warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || ''),
  error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
};

const prisma = new PrismaClient();

// Cache configuration
const CACHE_CONFIG = {
  profile: {
    ttl: 60 * 15, // 15 minutes
    prefix: 'profile:',
  },
  userProfile: {
    ttl: 60 * 10, // 10 minutes
    prefix: 'user_profile:',
  },
} as const;

/**
 * Validates phone number format
 */
function validatePhoneNumber(phoneNumber: string): boolean {
  // Support multiple formats: +1234567890, 1234567890, (123) 456-7890
  const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
  const cleanPhone = phoneNumber.replace(/[()\s-]/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

/**
 * Validates PAN number format (Indian context)
 */
function validatePanNumber(panNumber: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(panNumber.toUpperCase());
}

/**
 * Validates pincode format
 */
function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

/**
 * Gets cached profile by user ID
 */
async function getCachedProfile(userId: string) {
  try {
    const cached = await redis.get(`${CACHE_CONFIG.profile.prefix}${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.warn('Failed to get cached profile', { userId, error });
    return null;
  }
}

/**
 * Caches profile data
 */
async function cacheProfile(userId: string, profile: any) {
  try {
    await redis.setex(
      `${CACHE_CONFIG.profile.prefix}${userId}`,
      CACHE_CONFIG.profile.ttl,
      JSON.stringify(profile)
    );
  } catch (error) {
    logger.warn('Failed to cache profile', { userId, error });
  }
}

/**
 * Validates profile setup input with comprehensive checks
 */
function validateProfileSetupInput(input: ProfileSetupInput): void {
  const { personalDetails, storeDetails, documentation, permanentAddress, temporaryAddress, storeAddress } = input;

  // Validate personal details
  if (!personalDetails.firstName?.trim()) {
    throw new AppError('First name is required', ErrorCode.VALIDATION_ERROR);
  }
  if (!personalDetails.lastName?.trim()) {
    throw new AppError('Last name is required', ErrorCode.VALIDATION_ERROR);
  }
  if (personalDetails.phoneNumber && !validatePhoneNumber(personalDetails.phoneNumber)) {
    throw new AppError('Invalid phone number format', ErrorCode.VALIDATION_ERROR);
  }

  // Validate store details
  if (!storeDetails.storeName?.trim()) {
    throw new AppError('Store name is required', ErrorCode.VALIDATION_ERROR);
  }
  if (!storeDetails.storeType?.trim()) {
    throw new AppError('Store type is required', ErrorCode.VALIDATION_ERROR);
  }

  // Validate documentation
  if (!documentation.panNumber?.trim()) {
    throw new AppError('PAN number is required', ErrorCode.VALIDATION_ERROR);
  }
  if (!validatePanNumber(documentation.panNumber)) {
    throw new AppError('Invalid PAN number format', ErrorCode.VALIDATION_ERROR);
  }

  // Validate addresses
  const addresses = [permanentAddress, temporaryAddress, storeAddress];
  const addressTypes = ['permanent', 'temporary', 'store'];
  
  addresses.forEach((address, index) => {
    const type = addressTypes[index];
    if (!address.province?.trim()) {
      throw new AppError(`${type} address province is required`, ErrorCode.VALIDATION_ERROR);
    }
    if (!address.city?.trim()) {
      throw new AppError(`${type} address city is required`, ErrorCode.VALIDATION_ERROR);
    }
    if (!address.pinCode?.trim()) {
      throw new AppError(`${type} address pincode is required`, ErrorCode.VALIDATION_ERROR);
    }
    if (!validatePincode(address.pinCode)) {
      throw new AppError(`Invalid ${type} address pincode format`, ErrorCode.VALIDATION_ERROR);
    }
    if (!address.locality?.trim()) {
      throw new AppError(`${type} address locality is required`, ErrorCode.VALIDATION_ERROR);
    }
  });
}

/**
 * Creates profile with optimized transaction and error handling
 */
async function createProfileWithTransaction(userId: string, input: ProfileSetupInput) {
  return await prisma.$transaction(
    async (tx) => {
      // Create profile
      const profile = await tx.profile.create({
        data: {
          userId,
          firstName: input.personalDetails.firstName.trim(),
          lastName: input.personalDetails.lastName.trim(),
          phoneNumber: input.personalDetails.phoneNumber?.trim() || null,
        },
      });

      logger.info('Profile created successfully', { profileId: profile.id, userId });

      // Create addresses in batch
      const addressData = [
        {
          ...input.permanentAddress,
          profileId: profile.id,
          addressType: AddressType.PERMANENT,
          province: input.permanentAddress.province.trim(),
          city: input.permanentAddress.city.trim(),
          pinCode: input.permanentAddress.pinCode.trim(),
          locality: input.permanentAddress.locality.trim(),
          landMark: input.permanentAddress.landMark?.trim() || null,
          addressLabel: input.permanentAddress.addressLabel?.trim() || null,
        },
        {
          ...input.temporaryAddress,
          profileId: profile.id,
          addressType: AddressType.TEMPORARY,
          province: input.temporaryAddress.province.trim(),
          city: input.temporaryAddress.city.trim(),
          pinCode: input.temporaryAddress.pinCode.trim(),
          locality: input.temporaryAddress.locality.trim(),
          landMark: input.temporaryAddress.landMark?.trim() || null,
          addressLabel: input.temporaryAddress.addressLabel?.trim() || null,
        },
        {
          ...input.storeAddress,
          profileId: profile.id,
          addressType: AddressType.STORE,
          province: input.storeAddress.province.trim(),
          city: input.storeAddress.city.trim(),
          pinCode: input.storeAddress.pinCode.trim(),
          locality: input.storeAddress.locality.trim(),
          landMark: input.storeAddress.landMark?.trim() || null,
          addressLabel: input.storeAddress.addressLabel?.trim() || null,
        },
      ];

      const addresses = await Promise.all(
        addressData.map((address) => tx.address.create({ data: address }))
      );

      logger.info('Addresses created successfully', { 
        profileId: profile.id,
        addressCount: addresses.length 
      });

      const storeAddress = addresses[2];

      // Create store details
      await tx.storeDetail.create({
        data: {
          storeName: input.storeDetails.storeName.trim(),
          storeType: input.storeDetails.storeType.trim(),
          description: input.storeDetails.description?.trim() || null,
          profileId: profile.id,
          addressId: storeAddress.id,
        },
      });

      // Create documentation
      await tx.document.create({
        data: {
          panNumber: input.documentation.panNumber.toUpperCase().trim(),
          profileId: profile.id,
        },
      });

      logger.info('Profile setup completed successfully', { 
        profileId: profile.id,
        userId 
      });

      return profile;
    },
    {
      timeout: 30000, // 30 seconds timeout
      isolationLevel: 'Serializable',
    }
  );
}

export const profileResolvers = {
  Query: {
    /**
     * Get user profile with caching
     */
    profile: withAuth(
      AuthRequirement.AUTHENTICATED,
      instrumentWithMetrics('query.profile', async (
        _: unknown,
        args: { userId?: string },
        context: GraphQLContext
      ) => {
        const targetUserId = args.userId || context.user!.id;
        
        // Check authorization for viewing other profiles
        if (targetUserId !== context.user!.id && context.user!.role !== Role.ADMIN) {
          throw new AppError('Unauthorized to view this profile', ErrorCode.FORBIDDEN);
        }

        // Try cache first
        const cached = await getCachedProfile(targetUserId);
        if (cached) {
          logger.debug('Profile cache hit', { userId: targetUserId });
          return cached;
        }

        // Fetch from database
        const profile = await prisma.profile.findUnique({
          where: { userId: targetUserId },
          include: {
            addresses: true,
            storeDetails: {
              include: {
                address: true,
              },
            },
            documents: true,
          },
        });

        if (profile) {
          await cacheProfile(targetUserId, profile);
        }

        return profile;
      })
    ),
  },

  Mutation: {
    /**
     * Complete profile setup with enhanced validation and error handling
     */
    completeProfileSetup: withAuth(
      AuthRequirement.AUTHENTICATED,
      instrumentWithMetrics('mutation.completeProfileSetup', async (
        _: unknown,
        { input }: { input: ProfileSetupInput },
        context: GraphQLContext
      ) => {
        const startTime = Date.now();
        const userId = context.user!.id;

        try {
          // Validate input using Zod schema
          validateInput(profileSetupSchema, input);
          
          // Additional custom validation
          validateProfileSetupInput(input);

          // Check if profile already exists
          const existingProfile = await prisma.profile.findUnique({
            where: { userId },
            select: { id: true },
          });

          if (existingProfile) {
            throw new AppError(
              'Profile already exists for this user',
              ErrorCode.DUPLICATE_RESOURCE
            );
          }

          // Create profile with transaction
          const profile = await createProfileWithTransaction(userId, input);

          // Cache the new profile
          await cacheProfile(userId, profile);

          // Invalidate related caches
          await cacheInvalidation.invalidateUserRelated(userId);

          const duration = Date.now() - startTime;
          performanceLogger.logQuery('completeProfileSetup', duration, {
            userId,
            success: true,
          });

          logger.info('Profile setup completed successfully', {
            userId,
            profileId: profile.id,
            duration,
          });

          return {
            success: true,
            message: 'Profile created successfully',
            profileId: profile.id,
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          performanceLogger.logQuery('completeProfileSetup', duration, {
            userId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          if (error instanceof AppError) {
            logger.warn('Profile setup validation failed', {
              userId,
              error: error.message,
              code: error.code,
            });
            return {
              success: false,
              message: error.message,
              profileId: null,
            };
          }

          logger.error('Profile setup failed with unexpected error', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });

          return {
            success: false,
            message: 'An unexpected error occurred during profile setup',
            profileId: null,
          };
        }
      })
    ),

    /**
     * Update profile information
     */
    updateProfile: withAuth(
      AuthRequirement.AUTHENTICATED,
      instrumentWithMetrics('mutation.updateProfile', async (
        _: unknown,
        { input }: { input: Partial<ProfileSetupInput> },
        context: GraphQLContext
      ) => {
        const userId = context.user!.id;
        const startTime = Date.now();

        try {
          const existingProfile = await prisma.profile.findUnique({
            where: { userId },
            select: { id: true },
          });

          if (!existingProfile) {
            throw new AppError('Profile not found', ErrorCode.NOT_FOUND);
          }

          // Validate input if provided
          if (input.personalDetails) {
            if (input.personalDetails.phoneNumber && 
                !validatePhoneNumber(input.personalDetails.phoneNumber)) {
              throw new AppError('Invalid phone number format', ErrorCode.VALIDATION_ERROR);
            }
          }

          const updateData: any = {};
          if (input.personalDetails) {
            if (input.personalDetails.firstName) {
              updateData.firstName = input.personalDetails.firstName.trim();
            }
            if (input.personalDetails.lastName) {
              updateData.lastName = input.personalDetails.lastName.trim();
            }
            if (input.personalDetails.phoneNumber) {
              updateData.phoneNumber = input.personalDetails.phoneNumber.trim();
            }
          }

          const updatedProfile = await prisma.profile.update({
            where: { userId },
            data: updateData,
            include: {
              addresses: true,
              storeDetails: {
                include: {
                  address: true,
                },
              },
              documents: true,
            },
          });

          // Update cache
          await cacheProfile(userId, updatedProfile);
          await cacheInvalidation.invalidateUserRelated(userId);

          const duration = Date.now() - startTime;
          performanceLogger.logQuery('updateProfile', duration, {
            userId,
            success: true,
          });

          return {
            success: true,
            message: 'Profile updated successfully',
            profileId: updatedProfile.id,
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          performanceLogger.logQuery('updateProfile', duration, {
            userId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          if (error instanceof AppError) {
            return {
              success: false,
              message: error.message,
              profileId: null,
            };
          }

          logger.error('Profile update failed', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          return {
            success: false,
            message: 'Failed to update profile',
            profileId: null,
          };
        }
      })
    ),
  },
};
