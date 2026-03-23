import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildUrl } from "../utils/apiConfig";

const AuthPage = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [showCarouselOnly, setShowCarouselOnly] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [forgotForm, setForgotForm] = useState({ email: "", password: "" });
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const carouselImages = useMemo(
    () => [
      {
        src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&h=800&fit=crop&crop=center",
        alt: "Fresh salad bowl",
        caption: "Discover vibrant, healthy recipes curated for every mood.",
        fallback: "https://source.unsplash.com/1200x800/?salad,healthy,food"
      },
      {
        src: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&h=800&fit=crop&crop=center",
        alt: "Delicious pancakes with berries",
        caption: "Save your favorites and revisit them anytime in seconds.",
        fallback: "https://source.unsplash.com/1200x800/?pancakes,breakfast,food"
      },
      {
        src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop&crop=center",
        alt: "Chef preparing gourmet dish",
        caption: "Create elegant plates and inspire fellow food lovers.",
        fallback: "https://source.unsplash.com/1200x800/?chef,cooking,food"
      },
      {
        src: "https://images.unsplash.com/photo-1551782450-17144efb5723?w=1200&h=800&fit=crop&crop=center",
        alt: "Colorful pasta primavera",
        caption: "Explore diverse cuisines from around the world.",
        fallback: "https://source.unsplash.com/1200x800/?pasta,italian,food"
      },
      {
        src: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1200&h=800&fit=crop&crop=center",
        alt: "Grilled steak with vegetables",
        caption: "Master the art of perfect cooking techniques.",
        fallback: "https://source.unsplash.com/1200x800/?steak,grilled,food"
      },
      {
        src: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=800&fit=crop&crop=center",
        alt: "Fresh sushi rolls",
        caption: "Experience authentic flavors from global kitchens.",
        fallback: "https://source.unsplash.com/1200x800/?sushi,japanese,food"
      },
      {
        src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=center",
        alt: "Healthy smoothie bowl",
        caption: "Fuel your body with nutritious and delicious meals.",
        fallback: "https://source.unsplash.com/1200x800/?smoothie,healthy,food"
      },
    ],
    []
  );

  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      let loadedCount = 0;
      const totalImages = carouselImages.length; // Load all images

      carouselImages.forEach((image, index) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.src = image.src;
      });
    };

    preloadImages();
  }, [carouselImages]);

  // Auto-advance slides
  useEffect(() => {
    if (imagesLoaded) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length); // Cycle through all images
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [imagesLoaded, carouselImages.length]);
  const handleProceedToLogin = () => {
    setShowCarouselOnly(false);
  };

  const normalizeEmail = (value) => value.trim().toLowerCase();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setShowError(true);
      return;
    }

    try {
      let response = await fetch(buildUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(loginForm.email),
          password: loginForm.password,
        }),
      });

      response = await response.json();

      if (!response.error) {
        toast.success("Login Successful");
        localStorage.setItem("token", response.token);

        setTimeout(() => {
          window.location.href = "/recipes";
        }, 2000);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("An error occurred while logging in:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(buildUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          email: normalizeEmail(registerForm.email),
          password: registerForm.password,
        }),
      });

      if (response.ok) {
        const user = await response.json();

        if (user.error) {
          toast.warn("User already exists. Try with different email");
        } else {
          toast.success("Registration successful. Please login.");
          setTimeout(() => {
            setMode("login");
          }, 2000);
        }
      } else if (response.status === 409) {
        const errorData = await response.json();
        toast.warn(errorData.error || "User already exists. Try with different email");
      } else {
        console.error("Failed to register user:", response.status);
        toast.error("Registration failed.");
      }
    } catch (error) {
      console.error("An error occurred while registering user:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotForm.email || !forgotForm.password) {
      setShowError(true);
      return;
    }

    try {
      const response = await fetch(buildUrl("/auth/forgotpassword"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(forgotForm.email),
          newPassword: forgotForm.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Password updated successfully!");
        setTimeout(() => {
          setMode("login");
        }, 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password.");
    }
  };

  const renderActiveForm = () => {
    switch (mode) {
      case "register":
        return (
          <form onSubmit={handleRegisterSubmit}>
            <h2>Sign Up</h2>
            <div className="input-group">
              <label>Name *</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="input-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="input-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
            </div>
            <button type="submit">Register</button>
            <p className="form-helper-text">
              Already have an account?{" "}
              <span
                className="inline-link"
                onClick={() => setMode("login")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setMode("login");
                }}
              >
                Sign in
              </span>
            </p>
          </form>
        );
      case "forgot":
        return (
          <form onSubmit={handleForgotSubmit}>
            <h2>Reset Password</h2>
            <div className="input-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={forgotForm.email}
                onChange={(e) =>
                  setForgotForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="input-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={forgotForm.password}
                onChange={(e) =>
                  setForgotForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>
            <button type="submit">Update password</button>
          </form>
        );
      case "login":
      default:
        return (
          <form onSubmit={handleLoginSubmit}>
            <h2>Login</h2>
            <div className="input-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="input-group">
              <label>Password *</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                }
              />
            </div>
            <button type="submit">Sign in</button>
            <p className="form-helper-text">
              Don't have an account?{" "}
              <span
                className="inline-link"
                onClick={() => setMode("register")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setMode("register");
                }}
              >
                Sign up
              </span>
            </p>
            <p className="form-helper-text">
              <span
                className="inline-link"
                onClick={() => setMode("forgot")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setMode("forgot");
                }}
              >
                Forgot Password?
              </span>
            </p>
          </form>
        );
    }
  };

  return (
    <>
      {showCarouselOnly ? (
        // Full-page carousel screen
        <div className="full-carousel-screen">
          {!imagesLoaded ? (
            <div className="loading-screen">
              <div className="loading-spinner"></div>
              <p>Loading delicious recipes...</p>
            </div>
          ) : (
            <div className="static-background">
              <img
                key={currentSlide} // Force re-render when slide changes
                src={carouselImages[currentSlide].src}
                alt={carouselImages[currentSlide].alt}
                className="carousel-image"
                onError={(e) => {
                  console.log('Image failed to load:', carouselImages[currentSlide].src);
                  const currentImage = carouselImages[currentSlide];
                  // Try the fallback URL first
                  if (e.target.src !== currentImage.fallback) {
                    e.target.src = currentImage.fallback;
                  } else {
                    // If fallback also fails, use a reliable default image
                    e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=800&fit=crop&crop=center';
                  }
                }}
                onLoad={() => console.log('Image loaded successfully:', carouselImages[currentSlide].src)}
              />
              <div className="carousel-overlay"></div>
              <div className="carousel-content">
                <h1 className="carousel-title">Recipe Sharing Platform</h1>
                <p className="carousel-subtitle">{carouselImages[currentSlide].caption}</p>
                <button
                  className="carousel-cta-btn"
                  onClick={handleProceedToLogin}
                >
                  Get Started →
                </button>
                <div className="slide-indicators">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      className={`slide-dot ${currentSlide === index ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Login/Register form screen
        <div className="login-layout">
          <div className="SignupContainer form-panel">
            
            {renderActiveForm()}
            {showError && (
              <span className="fill-fields-error">Please fill all required fields</span>
            )}
            <ToastContainer />
          </div>
        </div>
      )}
    </>
  );
};

export default AuthPage;

