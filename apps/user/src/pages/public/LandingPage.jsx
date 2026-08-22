import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@shared/context/AuthContext";

export const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if (currentUser) {
      navigate(`/user/properties?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/login?redirect=/user/properties?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex-grow flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-24 overflow-hidden hero-pattern flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 w-full">
          {/* Hero Text */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-sm text-primary icon-fill">
                verified
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Trusted by students worldwide
              </span>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface max-w-2xl">
              Find your perfect{" "}
              <span className="text-primary relative inline-block">
                roommate
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-primary-fixed-dim"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></path>
                </svg>
              </span>
              , <br /> without the stress.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              A secure, university-approved platform connecting students and young
              professionals with compatible living partners and verified properties.
            </p>

            {/* Search/Filter Bar */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-lg bg-surface-container-lowest p-2 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant flex flex-col sm:flex-row gap-2 mt-4"
            >
              <div className="flex-grow flex items-center bg-surface-container px-4 py-3 rounded-lg">
                <span className="material-symbols-outlined text-outline mr-2">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 w-full font-body-md text-on-surface placeholder-outline-variant p-0 outline-none"
                  placeholder="City or University..."
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-tint transition-colors flex items-center justify-center whitespace-nowrap active:scale-95"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-4 mt-2 text-on-surface-variant">
              <div className="flex -space-x-3">
                <img
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBy47hsK5Waz3XyvYoDPr16VkbS6xbJ9okD-OhfUHbpaR2fHx1pCzBnAkg7wY1_4d7A4CWjW8DV2f_WjWmP22uLxCzeIax7gAsH8PXwbymVE_iGPEQL5Suslg-pQ7SxcxKauRaycDgmagwDQJMknYeReVojp0HIp81w0vr66wEUSLzZK7zHe8WYhwBvC1vMfyhFsc9Vj3YndGfzpKFmkkZBMC_ScmLrsAgWU33Gj1NkF6Eo2U-0beuk"
                  alt="Student avatar 1"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6c4I0b0gIn_1sLvBNu8eni3NZ2KK1UArMcl8IXZj8vmgtXoTafm97gsa5TSyQXpR7tE1nzVFcX_EkRDsgMTM3A6GtUHKwX3fWkyZ3F1lMUGMwfkOXKl8ys1VNWBnVpS09vRfCzIg7SsUjm28ah-lVSF2BBjo2A29N0Yv0saI_vJqjefJcbduHi9pwCJUKSl3UpNC1ytb28NoIxMLhuFfTIYf70yo2P3aeTjKJ0SFBT0-HImeznIRW"
                  alt="Student avatar 2"
                />
                <img
                  className="w-8 h-8 rounded-full border-2 border-surface object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVowSyn0Y52e0EGwYS3Ely-v3MBl0wjszIMqnt7Hd6kt7K96uItPn5PBGFW3PJSmnYkheCvCW8wiPn0Ij1IJXWPSZ5fUOHM62VC1AB0mhpEJCdTTQ8LljQK1akZFZ9-Xta5BnucEwsVe0-R2Ch5opYNOVDwM93TlD3vNkNiPvpWmAIgF49l5MpPKFZeUzNnICrg1zhBDhwsW1xvgYEwqD8BI81dTNNAKrWhPXhghzBYaRttVh__cyQ"
                  alt="Student avatar 3"
                />
              </div>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">
                Join 10,000+ matched roommates
              </span>
            </div>
          </div>

          {/* Hero Image / Card */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[1.5] rounded-2xl overflow-hidden shadow-xl border border-outline-variant bg-surface-container-low transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                alt="RoomieMatch App Interface showing roommate matching"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw198F3RReoAWQPDB6NBvw5ITvvjUJWnfgJ0h4eFG3yULmEEENUJT-eaYDrCdOKVlD-zLMi0WGnIVlaQhOKvcqs8lu9UcBbBH-Qe1i21rLIxCZxsvd59tEVBy6kSBNFxDMXhpJdY6rqmCtF8uQ3kFALY9GEdsaumK0Y7m5LtgKXTr63aJYRuft8TaU1PvS79p3tU2NCT402jvJrmqJjQaxpWNLjiUqcaZwwkmG1nC__PfFe0nsJVrHQEwrZ8nTT4STJg"
              />
              {/* Floating UI Elements */}
              <div className="absolute top-6 -left-6 bg-surface-container-lowest p-3 rounded-xl shadow-lg border border-outline-variant flex items-center gap-3 transform -rotate-3">
                <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary icon-fill">
                    handshake
                  </span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                    New Match
                  </p>
                  <p className="font-label-md text-label-md text-on-surface font-bold">
                    98% Compatibility
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
