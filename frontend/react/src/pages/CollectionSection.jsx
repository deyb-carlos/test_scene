import React from "react";
import Carousel from "./Carousel";

function CollectionSection() {
  const images1 = ["./dog.jpg", "./cat.jpg", "./squirrel.jpg"];
  const images2 = ["./mangun.jpg", "./gremlin.jpg", "./uwuwizard.jpg"];
  const images3 = ["./sakura.jpg", "./western.jpg", "./wizard.png"];

  return (
    <section
      id="collection"
      className="scroll-mt-16 py-8 md:py-16 bg-[#1B1B1B] text-white flex flex-col items-center px-4"
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-center">
        Collection
      </h1>

      {/* Flex container for carousels */}
      <div className="w-full max-w-400 mx-auto">
        {/* Single column on mobile, multi-column on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="flex justify-center">
            <Carousel images={images1} />
          </div>
          <div className="flex justify-center">
            <Carousel images={images2} />
          </div>
          <div className="flex justify-center">
            <Carousel images={images3} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default CollectionSection;
