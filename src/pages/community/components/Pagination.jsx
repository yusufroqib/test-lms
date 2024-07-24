import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";

const Pagination = ({ pageNumber, isNext }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleNavigation = (direction) => {
        const nextPageNumber = direction === "prev" ? pageNumber - 1 : pageNumber + 1;
        const newUrl = formUrlQuery({
            params: searchParams.toString(),
            key: "page",
            value: nextPageNumber.toString(),
        });
        navigate(newUrl);
    };

    if (!isNext && pageNumber === 1)
        return null;

    return (
        <div className="flex w-full items-center justify-center gap-2">
            <Button disabled={pageNumber === 1} onClick={() => handleNavigation("prev")} className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border">
                <p className="body-medium text-dark200_light800">Prev</p>
            </Button>
            <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
                <p className="body-semibold text-light-900">{pageNumber}</p>
            </div>
            <Button disabled={!isNext} onClick={() => handleNavigation("next")} className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border">
                <p className="body-medium text-dark200_light800">Next</p>
            </Button>
        </div>
    );
};

export default Pagination;
