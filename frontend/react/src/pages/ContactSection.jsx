import React from "react";

function ContactSection() {
  return (
      <section
        id="contact"
        className="scroll-mt-16 py-16 bg-[#1B1B1B] text-white flex flex-col items-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-10">Meet the Devs</h1>
              {/* Group photo with description */}
        <div className="w-full px-4 md:w-4/5 mb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Group photo */}
            <div className="lg:w-1/2">
              <div className="bg-gray-100 w-full h-64 md:h-80 rounded-lg overflow-hidden">
                <img src="./group.jpg" alt="Development Team" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Group description */}
            <div className="lg:w-1/2 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <p className="text-gray-300 mb-3">
                We're a group of friends who met in the university, brought together by a shared love for programming and we've been building together 
                ever since. These days, you'll still find us on the same block, coding side by side and pushing each other to grow.
              </p>
              <p className="text-gray-300 mb-3">
                What makes our team unique isn't just our history, but the way we complement one another: where one of us hits a wall, another has the toolkit to break through. We've 
                learned to lean into each other's strengths and cover each other's blind spots, creating a well-rounded, resilient team.
              </p>
              <p className="text-gray-300">
                Over the years, we've delivered a range of successful projects by staying grounded in our values—quality, performance, and user experience. We're big believers in 
                collaborative development, ongoing learning, and building solutions that not only work but inspire.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4 md:w-4/5">
          {[
            {
              image: "./leonardo.jpg",
              name: "Carlos, Christian Dave",
              role: "Project Manager and Backend Lead",
            },
            { 
              image: "./michelangelo.jpg",
              name: "Guelas, Sean Marion", 
              role: "Documentation Specialist" 
            },
            {
              image: "./raphael.jpg",
              name: "Mergano, Rafael Andrew",
              role: "Full-Stack Support Developer",
            },
            { 
              image: "./donatello.jpg",
              name: "Yapan, Von Emil", 
              role: "Frontend Lead" 
            },
          ].map((dev, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-gray-100 h-48 w-full flex items-center justify-center overflow-hidden mb-3 rounded-lg">
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="w-full h-full object-cover rounded-lg [object-position:0%_30%]"
                />
              </div>
              <h2 className="text-lg font-semibold text-center">{dev.name}</h2>
              <p className="text-sm text-center">{dev.role}</p>
            </div>
          ))}
        </div>
      </section>
  );
}

export default ContactSection;