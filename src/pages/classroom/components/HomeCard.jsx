"use client";
import { cn } from "@/lib/utils";
const HomeCard = ({ className, img, title, description, handleClick }) => {
	return (
		<section
			className={cn(
				"bg-orange-1 px-4 py-6 flex flex-col justify-between w-full min-h-[260px] rounded-[14px] cursor-pointer",
				className
			)}
			onClick={handleClick}
		>
			<div className="flex-center glassmorphism size-12 rounded-[10px]">
				<img src={img} alt="meeting" width={27} height={27} />
			</div>

			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="text-lg font-normal">{description}</p>
			</div>
		</section>
	);
};
export default HomeCard;
