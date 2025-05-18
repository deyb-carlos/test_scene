import React from "react";

function FeatureSection() {
  // Feature data with SVG icons
  const features = [
    {
      icon: "./text-to-image.svg",
      title: "Text to Image",
      description:
        "Convert your text descriptions into stunning visual representations with our advanced AI technology.",
    },
    {
      icon: "./multi-output.svg",
      title: "Multi-Output",
      description: "Generate multiple output of images from a single input.",
    },
    {
      icon: "./editable.svg",
      title: "Fully Editable",
      description:
        "Edit and refine your generated content with our intuitive editing tools for perfect results.",
    },
    {
      icon: "./openpose.svg",
      title: "OpenPose",
      description: "Create images based on your own poses and references.",
    },
  ];

  return (
    <section
      id="features"
      className="scroll-mt-16 py-16 bg-[#1B1B1B] text-white"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          Features
        </h1>
        <div className="flex flex-col md:flex-row gap-10 items-center">
          {" "}
          {/* Ensures vertical alignment */}
          {/* Large image on the left */}
          <div className="md:w-full flex justify-start">
            <div className="rounded-lg overflow-hidden max-w-xl">
              <img
                src="./phone.png"
                alt="Phone Application"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          {/* Features on the right */}
          <div className="md:w-full space-y-8 self-center">
            {" "}
            {/* Centers features vertically */}
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 bg-[#1f1f1f] shadow-2xl bg-opacity-50 p-6 rounded-lg"
              >
                <div className="flex-shrink-0 bg-white rounded-full w-20 h-20 flex items-center justify-center">
                  <img
                    className="h-12 w-12"
                    src={feature.icon}
                    alt={feature.title}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold mb-2">{feature.title}</h2>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 mx-auto max-w-400 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <img
              src="./poseinput.jpg"
              alt="Step 1"
              className="w-full h-auto max-h-150 object-cover rounded-lg"
            />
            <p className="mt-2 text-center text-gray-300">OpenPose Input</p>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:block rotate-90 md:rotate-0">
            <img
              src="./arrow.svg"
              alt="Arrow"
              className="h-10 w-10 md:h-20 md:w-20" // Increased arrow size
            />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <img
              src="./openpose_bones.jpg"
              alt="Step 2"
              className="w-full h-auto max-h-150 object-cover rounded-lg"
            />
            <p className="mt-2 text-center text-gray-300">OpenPose Bones</p>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:block rotate-90 md:rotate-0">
            <img
              src="./arrow.svg"
              alt="Arrow"
              className="h-10 w-10 md:h-20 md:w-20" // Increased arrow size
            />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <img
              src="./poseoutput.jpg"
              alt="Step 3"
              className="w-full h-auto max-h-150 object-cover rounded-lg"
            />
            <p className="mt-2 text-center text-gray-300">OpenPose Output</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
