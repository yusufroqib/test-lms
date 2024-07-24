import { useCallback } from 'react';
import { useReadContract, useWriteContract, useTransaction } from 'wagmi';
// import { useReadContract, useWriteContract, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { COURSE_PAYMENT_ABI, COURSE_PAYMENT_CA } from '@/contracts/coursePayment';


// const COURSE_PAYMENT_CA = 'YOUR_COURSE_PAYMENT_CONTRACT_ADDRESS';
// const COURSE_PAYMENT_ABI = ["bnghj"]; // Your CoursePayment contract ABI here

export function useCoursePayment() {

  // Register Tutor
  const { writeContract: registerTutor } = useWriteContract();

  // Update Tutor Address
  const { writeContract: updateTutorAddress } = useWriteContract();

  // Withdraw Tutor Balance
  const { writeContract: withdrawTutorBalance } = useWriteContract();

  // Purchase Course
  const { writeContract: purchaseCourse, data: purchaseData } = useWriteContract();
  // const { isLoading: isPurchaseProcessing, isSuccess: isPurchaseComplete } = useWaitForTransaction({
  //   hash: purchaseData?.hash,
  // })

  const { isLoading: isPurchaseProcessing, isSuccess: isPurchaseComplete } = useTransaction({
    hash: purchaseData?.hash,
  })

  // Get Tutor Balance
  const getTutorBalance = useCallback((tutorId) => {
    return useReadContract({
      address: COURSE_PAYMENT_CA,
      abi: COURSE_PAYMENT_ABI,
      functionName: 'getTutorBalance',
      args: [tutorId],
    });
  }, []);

  // Get Total Tutor Balances
  const { data: totalTutorBalances, isError: isTotalBalancesError, isLoading: isTotalBalancesLoading } = useReadContract({
    address: COURSE_PAYMENT_CA,
    abi: COURSE_PAYMENT_ABI,
    functionName: 'getTotalTutorBalances',
  });

  // Get Platform Fee
  const { data: platformFee, isError: isPlatformFeeError, isLoading: isPlatformFeeLoading } = useReadContract({
    address: COURSE_PAYMENT_CA,
    abi: COURSE_PAYMENT_ABI,
    functionName: 'getPlatformFee',
  });

  // Format balances
  const formattedTotalTutorBalances = totalTutorBalances ? formatUnits(totalTutorBalances, 6) : '0';
  const formattedPlatformFee = platformFee ? formatUnits(platformFee, 6) : '0';

  return {
    registerTutor: (tutorId) => registerTutor({
      address: COURSE_PAYMENT_CA,
      abi: COURSE_PAYMENT_ABI,
      functionName: 'registerTutor',
      args: [tutorId],
    }),
    updateTutorAddress: (tutorId, newAddress) => updateTutorAddress({
      address: COURSE_PAYMENT_CA,
      abi: COURSE_PAYMENT_ABI,
      functionName: 'updateTutorAddress',
      args: [tutorId, newAddress],
    }),
    withdrawTutorBalance: (tutorId, amount) => withdrawTutorBalance({
      address: COURSE_PAYMENT_CA,
      abi: COURSE_PAYMENT_ABI,
      functionName: 'withdrawTutorBalance',
      args: [tutorId, parseUnits(amount, 6)],
    }),
    purchaseCourse: (tutorId, amount, courseId) => purchaseCourse({
      address: COURSE_PAYMENT_CA,
      abi: COURSE_PAYMENT_ABI,
      functionName: 'purchaseCourse',
      args: [tutorId, parseUnits(amount, 6), courseId],
    }),
    getTutorBalance,
    totalTutorBalances: formattedTotalTutorBalances,
    platformFee: formattedPlatformFee,
    isPurchaseProcessing,
    isPurchaseComplete,
    isTotalBalancesError,
    isTotalBalancesLoading,
    isPlatformFeeError,
    isPlatformFeeLoading,
  };
}