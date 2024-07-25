import { useCallback } from "react";
import {
	useReadContract,
	useWriteContract,
	useTransaction,
	useAccount,
	useConfig,
	useSwitchChain,
	useWaitForTransactionReceipt,
} from "wagmi";
// import { useReadContract, useWriteContract, useWaitForTransaction } from 'wagmi';
import { parseUnits, formatUnits } from "viem";
import {
	COURSE_PAYMENT_ABI,
	COURSE_PAYMENT_CA,
} from "@/contracts/coursePayment";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import toast from "react-hot-toast";

const CORRECT_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID, 10);

console.log(CORRECT_CHAIN_ID);

// const COURSE_PAYMENT_CA = 'YOUR_COURSE_PAYMENT_CONTRACT_ADDRESS';
// const COURSE_PAYMENT_ABI = ["bnghj"]; // Your CoursePayment contract ABI here

export function useCoursePayment() {
	const { address, isConnected, chain } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { switchChain } = useSwitchChain();

	// const { chains } = useConfig()
	// console.log(chain)

	// Helper function to check if the wallet is connected
	const checkConnectionAndChain = useCallback(async () => {
		if (!isConnected) {
			toast.error("Please connect your wallet.");
			openConnectModal?.();
			return false;
		}
		if (chain?.id !== CORRECT_CHAIN_ID) {
			toast.error("Switching to the correct network...");
			try {
				await switchChain({ chainId: CORRECT_CHAIN_ID });
			} catch (error) {
				console.error("Failed to switch network:", error);
				toast.error("Failed to switch network. Please switch manually.");
				return false;
			}
		}
		return true;
	}, [isConnected, openConnectModal, chain, switchChain]);

	// Wrap contract write functions with the connection check
	const wrapWithConnectionAndChainCheck = useCallback(
		(writeFunction) => {
			return async (...args) => {
				if (await checkConnectionAndChain()) {
					return writeFunction(...args);
				}
			};
		},
		[checkConnectionAndChain]
	);

	const {
		writeContract: registerTutorRaw,
		data: registerTutorHash,
		isPending: isRegisterTutorPending,
		error: registerTutorError,
	} = useWriteContract();
	const { writeContract: updateTutorAddressRaw } = useWriteContract();
	const { writeContract: withdrawTutorBalanceRaw } = useWriteContract();
	const { writeContract: purchaseCourseRaw, data: purchaseData } =
		useWriteContract();
	// console.log(error);
	// Register Tutor
	const registerTutor = wrapWithConnectionAndChainCheck((tutorId) =>
		registerTutorRaw({
			address: COURSE_PAYMENT_CA,
			abi: COURSE_PAYMENT_ABI,
			functionName: "registerTutor",
			args: [tutorId],
		})
	);

	// Update Tutor Address
	const updateTutorAddress = wrapWithConnectionAndChainCheck(
		(tutorId, newAddress) =>
			updateTutorAddressRaw({
				address: COURSE_PAYMENT_CA,
				abi: COURSE_PAYMENT_ABI,
				functionName: "updateTutorAddress",
				args: [tutorId, newAddress],
			})
	);

	// Withdraw Tutor Balance
	const withdrawTutorBalance = wrapWithConnectionAndChainCheck(
		(tutorId, amount) =>
			withdrawTutorBalanceRaw({
				address: COURSE_PAYMENT_CA,
				abi: COURSE_PAYMENT_ABI,
				functionName: "withdrawTutorBalance",
				args: [tutorId, parseUnits(amount, 6)],
			})
	);

	// Purchase Course
	const purchaseCourse = wrapWithConnectionAndChainCheck(
		(tutorId, amount, courseId) =>
			purchaseCourseRaw({
				address: COURSE_PAYMENT_CA,
				abi: COURSE_PAYMENT_ABI,
				functionName: "purchaseCourse",
				args: [tutorId, parseUnits(amount, 6), courseId],
			})
	);

	// const { isLoading: isPurchaseProcessing, isSuccess: isPurchaseComplete } = useWaitForTransaction({
	//   hash: purchaseData?.hash,
	// })

	const { isLoading: isPurchaseProcessing, isSuccess: isPurchaseComplete } =
		useWaitForTransactionReceipt({
			hash: purchaseData?.hash,
		});

	// Get Tutor Balance
	const getTutorBalance = useCallback((tutorId) => {
		return useReadContract({
			address: COURSE_PAYMENT_CA,
			abi: COURSE_PAYMENT_ABI,
			functionName: "getTutorBalance",
			args: [tutorId],
		});
	}, []);

	// Get Total Tutor Balances
	const {
		data: totalTutorBalances,
		isError: isTotalBalancesError,
		isLoading: isTotalBalancesLoading,
	} = useReadContract({
		address: COURSE_PAYMENT_CA,
		abi: COURSE_PAYMENT_ABI,
		functionName: "getTotalTutorBalances",
	});

	// Get Platform Fee
	const {
		data: platformFee,
		isError: isPlatformFeeError,
		isLoading: isPlatformFeeLoading,
	} = useReadContract({
		address: COURSE_PAYMENT_CA,
		abi: COURSE_PAYMENT_ABI,
		functionName: "getPlatformFee",
	});

	// Format balances
	const formattedTotalTutorBalances = totalTutorBalances
		? formatUnits(totalTutorBalances, 6)
		: "0";
	const formattedPlatformFee = platformFee ? formatUnits(platformFee, 6) : "0";

	// console.log(registerTutorError)

	return {
		registerTutor,
		registerTutorHash,
		isRegisterTutorPending,
		registerTutorError:
			registerTutorError?.cause?.code === 4001
				? "User denied transaction signature."
				: registerTutorError?.cause?.reason,
        
		updateTutorAddress,
		withdrawTutorBalance,
		purchaseCourse,
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
