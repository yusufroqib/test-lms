import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CreditCard, ArrowRightLeft, Edit, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import truncateWalletAddress from "@/lib/truncateWalletAddress";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatUnits } from "viem";
import { useCoursePayment } from "@/hooks/useCoursePayment";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt } from "wagmi";
import { useRefreshMutation } from "@/features/auth/authApiSlice";

const CryptoWallet = () => {
	const [isEditingPaymentWallet, setIsEditingPaymentWallet] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);
	const { connectedWallets, paymentWallet, _id: tutorId } = useAuth();
	const [selectedWallet, setSelectedWallet] = useState(paymentWallet);
	const [withdrawalAmount, setWithdrawalAmount] = useState("");
	const { getTutorBalance } = useCoursePayment();
    const [refresh] = useRefreshMutation();


	const { data: tutorUSDCBalance, refetch } = getTutorBalance(tutorId);
	const USDCBalance = Number(formatUnits(tutorUSDCBalance || 0, 6)) || 0;

	const [toastId, setToastId] = useState(null);
	const [withdrawalToastId, setWithdrawalToastId] = useState(null);
	const {
		updateTutorAddress,
		updateTutorAddressHash,
		isUpdateTutorAddressPending,
		updateTutorAddressError,
		withdrawTutorBalance,
		withdrawTutorBalanceHash,
		isWithdrawTutorBalancePending,
		withdrawTutorBalanceError,
	} = useCoursePayment();
	const { isLoading: isUpdateConfirming, isSuccess: isUpdateConfirmed } =
		useWaitForTransactionReceipt({
			hash: updateTutorAddressHash,
		});
	const {
		isLoading: isWithdrawalConfirming,
		isSuccess: isWithdrawalConfirmed,
	} = useWaitForTransactionReceipt({
		hash: withdrawTutorBalanceHash,
	});

	// console.log(isAllowanceSufficient);

	useEffect(() => {
		if (isUpdateTutorAddressPending) {
			const newToastId = toast.loading("Waiting for approval from wallet...");
			// console.log(toastId)
			setToastId(newToastId);
			console.log("Transaction is pending...");
		}
		if (isUpdateConfirming) {
			if (toastId) toast.dismiss(toastId);
			const newToastId = toast.loading(
				"Waiting for confirmation on the blockchain..."
			);
			setToastId(newToastId);
			console.log("Waiting for confirmation...");
		}
		if (isUpdateConfirmed) {
			console.log("Transaction confirmed!");
			toast.success("Address updated successfully!", { id: toastId });
            refresh()
			// navigate(`/study/${courseId}`);
		}
		// toast.dismiss(toastId);
		if (updateTutorAddressError) {
			toast.error(purchaseError, { id: toastId });
		}
	}, [
		isUpdateTutorAddressPending,
		updateTutorAddressError,
		isUpdateConfirming,
		isUpdateConfirmed,
	]);

	useEffect(() => {
		if (isWithdrawTutorBalancePending) {
			const newToastId = toast.loading("Waiting for approval from wallet...");
			// console.log(toastId)
			setWithdrawalToastId(newToastId);
		}
		if (isWithdrawalConfirming) {
			if (withdrawalToastId) toast.dismiss(withdrawalToastId);
			const newToastId = toast.loading(
				"Waiting for confirmation on the blockchain..."
			);
			setWithdrawalToastId(newToastId);
			// console.log("Waiting for confirmation...");
		}
		if (isWithdrawalConfirmed) {
			// console.log("Transaction confirmed!");
			toast.success("Withdrawal processed successfully", {
				id: withdrawalToastId,
			});
			refetch();
		}
		// toast.dismiss(toastId);
		if (withdrawTutorBalanceError) {
			toast.error(withdrawTutorBalanceError, { id: withdrawalToastId });
		}
	}, [
		isWithdrawTutorBalancePending,
		isWithdrawalConfirming,
		isWithdrawalConfirmed,
		withdrawTutorBalanceError,
	]);

	const handleWalletChange = () => {
		// setSelectedWallet(value);

		updateTutorAddress(tutorId, selectedWallet);
		setIsEditingPaymentWallet(false);
	};

	const handleWithdrawal = () => {
		// Implement withdrawal logic here
		console.log(`Withdrawing ${withdrawalAmount} USDC`);
		// console.log(typeof withdrawalAmount)
		withdrawTutorBalance(tutorId, withdrawalAmount);
		setIsWithdrawing(false);
		setWithdrawalAmount("");
	};

	return (
		<div className="max-w-2xl mx-auto flex justify-center items-center min-h-full p-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold flex items-center">
						<Wallet className="mr-2" /> USDC Wallet Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<span className="text-lg font-semibold">
								Current USDC Balance:
							</span>
							<span className="text-2xl font-bold text-green-600">
								${USDCBalance?.toFixed(2) || "0.00"}
							</span>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-2">Connected Wallets:</h3>
							<ul className="list-disc list-inside">
								{connectedWallets.map((wallet) => (
									<li key={wallet} className="mb-1">
										{truncateWalletAddress(wallet)}
										{wallet === paymentWallet && (
											<span className="text-sm text-green-600 ml-2">
												(Current Payment Wallet)
											</span>
										)}
									</li>
								))}
							</ul>
						</div>

						{!isWithdrawing && (
							<div className="flex space-x-2">
								<AlertDialog
									open={isEditingPaymentWallet}
									onOpenChange={setIsEditingPaymentWallet}
								>
									<AlertDialogTrigger>
										<Button>
											<Edit className="mr-2 h-4 w-4" /> Update Payment Wallet
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Update Payment Wallet</AlertDialogTitle>
											<AlertDialogDescription>
												Select from the addresses below linked to your account
												to receive payments.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<RadioGroup
											value={selectedWallet}
											onValueChange={(value) => setSelectedWallet(value)}
											className="space-y-2"
										>
											{connectedWallets.map((wallet) => (
												<div
													key={wallet}
													className="flex items-center space-x-2"
												>
													<RadioGroupItem value={wallet} id={wallet} />
													<Label htmlFor={wallet} className="font-medium">
														{truncateWalletAddress(wallet)}
													</Label>
												</div>
											))}
										</RadioGroup>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={handleWalletChange}>
												Continue
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>

								<Button onClick={() => setIsWithdrawing(true)}>
									<ArrowRightLeft className="mr-2 h-4 w-4" /> Withdraw USDC
								</Button>
							</div>
						)}

						{isWithdrawing && (
							<div>
								<h3 className="text-lg font-semibold mb-2">Withdraw USDC</h3>
								<div className="flex space-x-2">
									<Input
										type="number"
										placeholder="Amount"
										value={withdrawalAmount}
										onChange={(e) => setWithdrawalAmount(e.target.value)}
									/>
									<Button onClick={handleWithdrawal}>
										<ArrowRightLeft className="mr-2 h-4 w-4" /> Withdraw
									</Button>
									<Button
										variant="outline"
										onClick={() => setIsWithdrawing(false)}
									>
										<X className="mr-2 h-4 w-4" /> Cancel
									</Button>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default CryptoWallet;
