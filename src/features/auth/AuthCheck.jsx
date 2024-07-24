import { useDispatch } from "react-redux";
// AuthCheck.js
import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { setWalletAuthStatus } from "./authSlice";

export function AuthCheck({ walletAuthStatus }) {
	const dispatch = useDispatch();
	const { _id: userId, connectedWallets } = useAuth();
	const { isConnected, address } = useAccount();

	useEffect(() => {
		if (
			walletAuthStatus === "authenticated" &&
			address &&
			!connectedWallets.includes(address)
		) {
			dispatch(setWalletAuthStatus({ walletAuthStatus: "unauthenticated" }));

			// setStatus("unauthenticated");
		} else if (userId && address && connectedWallets.includes(address)) {
			dispatch(setWalletAuthStatus({ walletAuthStatus: "authenticated" }));
		}
	}, [connectedWallets, isConnected, address]);

	return null; // This component doesn't render anything
}
