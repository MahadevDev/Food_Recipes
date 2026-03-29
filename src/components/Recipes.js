// src/components/Recipes.jsx

import React, { useCallback, useEffect, useState, useRef } from "react";
import RecipeCard from "./RecipeCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { buildUrl } from "../utils/apiConfig";

const CATEGORY_OPTIONS = [
  "South Indian",
  "North Indian", 
  "Andhra",
  "Karnataka",
  "Street Food",
  "Breakfast",
  "Snacks",
  "Desserts",
  "Beverages"
];

const normalizeCategoryKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, " ");

const toCanonicalCategory = (value) => {
  const key = normalizeCategoryKey(value);
  const match = CATEGORY_OPTIONS.find(
    (option) => normalizeCategoryKey(option) === key
  );
  return match || "Other";
};

const normalizeDietaryType = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  if (normalized === "all") return "All";
  if (normalized === "vegetarian" || normalized === "veg") return "Vegetarian";
  if (
    normalized === "non-vegetarian" ||
    normalized === "nonvegetarian" ||
    normalized === "non-veg" ||
    normalized === "nonveg"
  ) {
    return "Non-Vegetarian";
  }

  return "Other";
};

const NON_VEG_KEYWORDS = [
  /\bchicken\b/i,
  /\bmutton\b/i,
  /\bmeat\b/i,
  /\bfish\b/i,
  /\bprawn\b/i,
  /\bshrimp\b/i,
  /\bcrab\b/i,
  /\begg(s)?\b/i,
  /\bomelette\b/i,
  /\bduck\b/i,
  /\bbeef\b/i,
  /\bpork\b/i,
  /\bseafood\b/i,
];

const getRecipeDietaryType = (recipe) => {
  const explicitType = normalizeDietaryType(recipe?.recipeType);

  // Keep explicit non-veg and all as-is.
  if (explicitType === "Non-Vegetarian" || explicitType === "All") {
    return explicitType;
  }

  const textToCheck = [
    recipe?.title,
    recipe?.description,
    recipe?.instructions,
    ...(Array.isArray(recipe?.ingredients) ? recipe.ingredients : []),
  ]
    .filter(Boolean)
    .join(" ");

  if (NON_VEG_KEYWORDS.some((pattern) => pattern.test(textToCheck))) {
    return "Non-Vegetarian";
  }

  return explicitType;
};

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [orderedRecipes, setOrderedRecipes] = useState([]);
  const [hiddenRecipeIds, setHiddenRecipeIds] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [activeView, setActiveView] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDietaryType, setSelectedDietaryType] = useState("All");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoRecipe, setInfoRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const shareDropdownRef = useRef(null);
  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    comment: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "South Indian",
    recipeType: "Other",
    description: "",
    imageUrl: "",
    prepTime: "",
    price: "",
    ingredientsText: "",
    instructions: "",
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareRecipe, setShareRecipe] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [orderInfo, setOrderInfo] = useState({ 
    name: "", 
    phone: "",
    paymentMethod: "cash" // Default to cash on delivery
  });
  const token = localStorage.getItem("token");

  const getCurrentUserId = useCallback(() => {
    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      return tokenData?._id || null;
    } catch (error) {
      return null;
    }
  }, [token]);

  const isRecipeOwner = useCallback(
    (recipe) => {
      const currentUserId = getCurrentUserId();
      const recipeOwnerId =
        typeof recipe?.userId === "object" && recipe?.userId !== null
          ? recipe.userId._id
          : recipe?.userId;
      return Boolean(currentUserId && recipeOwnerId && recipeOwnerId === currentUserId);
    },
    [getCurrentUserId]
  );

  const fetchRecipes = useCallback(async () => {
    if (!token) {
      setLoadError("Please log in again to view recipes.");
      return;
    }

    try {
      setLoadError("");
      setLoading(true);
      const res = await fetch(buildUrl("/auth/recipe"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to fetch recipes from server.");
      }
      
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      const message = err.message || "Could not load recipes.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareDropdownRef.current && !shareDropdownRef.current.contains(event.target)) {
        shareDropdownRef.current.classList.remove('active');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(buildUrl(`/auth/recipe/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      toast.success("Recipe deleted");
      // remove from state
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      setHiddenRecipeIds((prev) => prev.filter((recipeId) => recipeId !== id));
    } catch (err) {
      console.error(err);
      toast.error("Error deleting recipe");
    }
  };

  const handleViewInfo = (id) => {
    const recipe = recipes.find((item) => item._id === id);
    if (!recipe) {
      toast.error("Recipe information not found");
      return;
    }
    setInfoRecipe(recipe);
    setReviewForm({ rating: "5", comment: "" });
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
    setInfoRecipe(null);
    setReviewForm({ rating: "5", comment: "" });
  };

  const handleShare = (platform, recipe) => {
    const recipeUrl = `${window.location.origin}/recipes/${recipe._id}`;
    const recipeTitle = recipe.title;
    const recipeDescription = recipe.description || `Check out this amazing ${recipeTitle} recipe!`;
    
    let shareUrl = '';
    
    switch(platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${recipeTitle} - ${recipeDescription} ${recipeUrl}`)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we copy to clipboard
        navigator.clipboard.writeText(`${recipeTitle} - ${recipeDescription} ${recipeUrl}`);
        toast.info('Recipe link copied! Share it on Instagram 📸');
        return;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}&quote=${encodeURIComponent(recipeDescription)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${recipeTitle} - ${recipeDescription}`)}&url=${encodeURIComponent(recipeUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(recipeUrl)}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(recipeUrl)}&description=${encodeURIComponent(recipeDescription)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(recipeUrl)}&title=${encodeURIComponent(recipeTitle)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(recipeUrl)}&text=${encodeURIComponent(`${recipeTitle} - ${recipeDescription}`)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(`${recipeTitle} - ${recipeDescription} ${recipeUrl}`);
        toast.success('Recipe link copied to clipboard! 📋');
        return;
      case 'easy-share':
        // Easy share - copy to clipboard with success message
        navigator.clipboard.writeText(`${recipeTitle} - ${recipeDescription} ${recipeUrl}`);
        toast.success('Recipe link copied! Share it anywhere 🚀');
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleShareOpen = (recipe) => {
    setShareRecipe(recipe);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setShareRecipe(null);
  };

  const renderStars = (value) => {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));
    const fullStars = Math.round(safeValue);
    return `${"★".repeat(fullStars)}${"☆".repeat(5 - fullStars)}`;
  };

  const handleReviewSubmit = async () => {
    if (!infoRecipe?._id) {
      toast.error("Recipe not selected");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please enter your review comment");
      return;
    }

    try {
      const reviewPayload = {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      const applyLocalReview = () => {
        const localReview = {
          userName: "You",
          rating: reviewPayload.rating,
          comment: reviewPayload.comment,
        };

        const existingReviews = Array.isArray(infoRecipe.reviews) ? infoRecipe.reviews : [];
        const updatedReviews = [...existingReviews, localReview];
        const reviewCount = updatedReviews.length;
        const total = updatedReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
        const averageRating = reviewCount ? Number((total / reviewCount).toFixed(1)) : 0;

        const updatedRecipe = {
          ...infoRecipe,
          reviews: updatedReviews,
          reviewCount,
          averageRating,
        };

        setRecipes((prev) =>
          prev.map((recipe) =>
            recipe._id === updatedRecipe._id ? updatedRecipe : recipe
          )
        );
        setOrderedRecipes((prev) =>
          prev.map((recipe) =>
            recipe._id === updatedRecipe._id
              ? { ...updatedRecipe, orderInfo: recipe.orderInfo }
              : recipe
          )
        );
        setInfoRecipe(updatedRecipe);
      };

      let res = await fetch(buildUrl(`/auth/recipe/${infoRecipe._id}/reviews`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewPayload),
      });

      if (res.status === 404) {
        // Compatibility fallback for older/alternate route layout.
        res = await fetch(buildUrl(`/auth/recipe/reviews/${infoRecipe._id}`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewPayload),
        });
      }

      if (res.status === 404) {
        applyLocalReview();
        setReviewForm({ rating: "5", comment: "" });
        toast.success("Review added on screen. Restart backend to save reviews permanently.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit review");
      }

      const updatedRecipe = await res.json();
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe._id === updatedRecipe._id ? updatedRecipe : recipe
        )
      );
      setOrderedRecipes((prev) =>
        prev.map((recipe) =>
          recipe._id === updatedRecipe._id
            ? { ...updatedRecipe, orderInfo: recipe.orderInfo }
            : recipe
        )
      );
      setInfoRecipe(updatedRecipe);
      setReviewForm({ rating: "5", comment: "" });
      toast.success("Review added successfully");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error(error.message || "Could not add review");
    }
  };

  const handleEditOpen = (recipe) => {
    if (!recipe) {
      toast.error("Recipe not found for editing");
      return;
    }

    setEditRecipe(recipe);
    setEditForm({
      title: recipe.title || "",
      category: toCanonicalCategory(recipe.category),
      recipeType: normalizeDietaryType(recipe.recipeType),
      description: recipe.description || "",
      imageUrl: recipe.imageUrl || "",
      prepTime: recipe.prepTime ? String(recipe.prepTime) : "",
      price: recipe.price ? String(recipe.price) : "",
      ingredientsText: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join(", ")
        : (recipe.ingredients || ""),
      instructions: recipe.instructions || "",
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditRecipe(null);
    setEditForm({
      title: "",
      category: "South Indian",
      recipeType: "Other",
      description: "",
      imageUrl: "",
      prepTime: "",
      price: "",
      ingredientsText: "",
      instructions: "",
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async () => {
    if (!editRecipe?._id) {
      toast.error("Recipe edit session expired. Please try again.");
      return;
    }

    if (!editForm.title.trim()) {
      toast.error("Recipe title is required");
      return;
    }

    const ingredients = editForm.ingredientsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: editForm.title.trim(),
      category: toCanonicalCategory(editForm.category),
      recipeType: normalizeDietaryType(editForm.recipeType),
      description: editForm.description.trim(),
      imageUrl: editForm.imageUrl.trim(),
      prepTime: Number(editForm.prepTime) || 0,
      price: Number(editForm.price) || 0,
      ingredients,
      instructions: editForm.instructions.trim(),
    };

    try {
      const res = await fetch(buildUrl(`/auth/recipe/${editRecipe._id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update recipe");
      }

      const updatedRecipe = await res.json();
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe._id === updatedRecipe._id ? updatedRecipe : recipe
        )
      );

      setOrderedRecipes((prev) =>
        prev.map((recipe) =>
          recipe._id === updatedRecipe._id
            ? { ...updatedRecipe, orderInfo: recipe.orderInfo }
            : recipe
        )
      );

      toast.success("Recipe updated successfully");
      closeEditModal();
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error(error.message || "Could not update recipe");
    }
  };

  const handleAddFavorite = async (id) => {
    try {
      const res = await fetch(buildUrl(`/auth/likedRecipes/${id}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add favorite");
      }
      toast.success("Added to favorites");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not add favorite");
    }
  };

  const handleOrderRecipe = async (id) => {
    try {
      const recipe = recipes.find(r => r._id === id);
      if (recipe) {
        // Check if recipe is already ordered
        if (orderedRecipes.some(r => r._id === id)) {
          toast.info("Recipe already ordered");
          return;
        }
        
        // Show order modal
        setSelectedRecipe(recipe);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error ordering recipe");
    }
  };

  const handleOrderSubmit = async () => {
    if (!orderInfo.name.trim() || !orderInfo.phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(orderInfo.phone.replace(/\s/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      // Handle online payment
      if (orderInfo.paymentMethod === "online") {
        // TEST PAYMENT - No backend required
        await processTestPayment();
      } else {
        // Cash on delivery - place order directly
        placeOrder();
      }
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("Error processing order. Please try again.");
    }
  };

  // Test Payment Processing (No Backend Required)
  const processTestPayment = async () => {
    try {
      // Show payment processing message
      toast.info("Initializing payment...");
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show payment options modal
      const paymentSuccess = await showPaymentOptions();
      
      if (paymentSuccess) {
        // Payment successful - place order
        placeOrder('Paid', 'test_payment_' + Date.now());
      } else {
        // Payment failed or cancelled
        toast.info("Payment cancelled. You can try again or select cash on delivery.");
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  // Show payment options modal
  const showPaymentOptions = () => {
    return new Promise((resolve) => {
      // Create a simple payment modal
      const paymentModal = document.createElement('div');
      paymentModal.className = 'payment-modal-overlay';
      paymentModal.innerHTML = `
        <div class="payment-modal">
          <div class="payment-modal-header">
            <h3>💳 Select Payment Method</h3>
            <button class="close-payment-modal">&times;</button>
          </div>
          <div class="payment-modal-body">
            <div class="payment-methods">
              <button class="payment-method-btn" data-method="card">
                <span class="payment-icon">💳</span>
                <div>
                  <strong>Credit/Debit Card</strong>
                  <small>Visa, Mastercard, Rupay</small>
                </div>
              </button>
              <button class="payment-method-btn" data-method="upi">
                <span class="payment-icon">📱</span>
                <div>
                  <strong>UPI</strong>
                  <small>Google Pay, PhonePe, Paytm</small>
                </div>
              </button>
              <button class="payment-method-btn" data-method="netbanking">
                <span class="payment-icon">🏦</span>
                <div>
                  <strong>Net Banking</strong>
                  <small>All major banks</small>
                </div>
              </button>
            </div>
            <div class="test-payment-info">
              <p>🧪 <strong>Test Mode</strong> - No actual charges</p>
              <small>Use test card: 4111 1111 1111 1111</small>
            </div>
          </div>
        </div>
      `;

      // Add styles
      paymentModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
      `;

      document.body.appendChild(paymentModal);

      // Handle payment method selection
      const paymentButtons = paymentModal.querySelectorAll('.payment-method-btn');
      const closeButton = paymentModal.querySelector('.close-payment-modal');

      paymentButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
          const method = btn.dataset.method;
          
          // Simulate payment processing
          btn.disabled = true;
          btn.innerHTML = `
            <div class="payment-spinner"></div>
            <div>
              <strong>Processing...</strong>
              <small>Please wait</small>
            </div>
          `;
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Show success
          btn.innerHTML = `
            <span class="payment-icon">✅</span>
            <div>
              <strong>Payment Successful!</strong>
              <small>${method} payment completed</small>
            </div>
          `;
          
          setTimeout(() => {
            document.body.removeChild(paymentModal);
            resolve(true);
          }, 1000);
        });
      });

      closeButton.addEventListener('click', () => {
        document.body.removeChild(paymentModal);
        resolve(false);
      });

      // Close on backdrop click
      paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
          document.body.removeChild(paymentModal);
          resolve(false);
        }
      });
    });
  };

  // Place order after successful payment
  const placeOrder = (paymentStatus = 'Pending', paymentId = null) => {
    const orderedRecipe = {
      ...selectedRecipe,
      orderInfo: {
        name: orderInfo.name,
        phone: orderInfo.phone,
        paymentMethod: orderInfo.paymentMethod,
        paymentStatus: paymentStatus,
        paymentId: paymentId,
        orderDate: new Date().toLocaleDateString(),
        orderTime: new Date().toLocaleTimeString()
      }
    };
    
    setOrderedRecipes(prev => [...prev, orderedRecipe]);
    
    // Show appropriate success message
    const paymentMessage = orderInfo.paymentMethod === "online" && paymentStatus === "Paid"
      ? `Online payment completed! We'll contact ${orderInfo.name} at ${orderInfo.phone}`
      : `Order placed! We'll contact ${orderInfo.name} at ${orderInfo.phone} for cash on delivery`;
    
    toast.success(paymentMessage);
    
    // Reset modal
    setShowOrderModal(false);
    setSelectedRecipe(null);
    setOrderInfo({ name: "", phone: "", paymentMethod: "cash" });
  };

  const handleModalClose = () => {
    setShowOrderModal(false);
    setSelectedRecipe(null);
    setOrderInfo({ name: "", phone: "", paymentMethod: "cash" });
  };

  // Delete ordered recipe
  const handleDeleteOrder = (orderId) => {
    try {
      // Find the recipe to delete
      const recipeToDelete = orderedRecipes.find(r => r._id === orderId);
      
      if (recipeToDelete) {
        // Remove from ordered recipes
        setOrderedRecipes(prev => prev.filter(r => r._id !== orderId));
        
        // Show success message
        toast.success(`Order for "${recipeToDelete.title}" has been deleted`);
        
        // If no more orders, switch back to recipes view
        if (orderedRecipes.length === 1) {
          setActiveView("all");
        }
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order. Please try again.");
    }
  };

  // Save ordered recipes to localStorage for persistence
  const saveOrderedRecipes = (recipes) => {
    try {
      localStorage.setItem('orderedRecipes', JSON.stringify(recipes));
    } catch (error) {
      console.error("Error saving ordered recipes:", error);
    }
  };

  // Load ordered recipes from localStorage on component mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orderedRecipes');
    if (savedOrders) {
      try {
        setOrderedRecipes(JSON.parse(savedOrders));
      } catch (error) {
        console.error("Error loading saved orders:", error);
      }
    }
  }, []);

  // Save ordered recipes whenever they change
  useEffect(() => {
    saveOrderedRecipes(orderedRecipes);
  }, [orderedRecipes]);

  const handleSearchChange = async (e) => {
    const key = e.target.value;
    setSearchKey(key);

    if (key.trim().length === 0) {
      fetchRecipes();
    } else {
      try {
        const res = await fetch(buildUrl(`/auth/searchRecipes/${key}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Search failed");
        }
        const data = await res.json();
        setRecipes(data);
      } catch (err) {
        console.error(err);
        toast.error("Search fetch error");
      }
    }
  };

  const handleCloseRecipeCard = (id) => {
    setHiddenRecipeIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const visibleRecipes = recipes.filter((recipe) => !hiddenRecipeIds.includes(recipe._id));

  // Apply dietary filter to all recipes
  const filteredByDietary = visibleRecipes.filter((recipe) => {
    const recipeDietaryType = getRecipeDietaryType(recipe);

    if (selectedDietaryType === "All") {
      return true;
    } else if (selectedDietaryType === "Vegetarian") {
      return recipeDietaryType === "Vegetarian";
    } else if (selectedDietaryType === "Non-Vegetarian") {
      return recipeDietaryType === "Non-Vegetarian";
    } else if (selectedDietaryType === "Other") {
      return recipeDietaryType === "Other";
    }
    return false;
  });

  const filteredCategoryRecipes = visibleRecipes.filter(
    (recipe) => {
      const categoryMatch =
        normalizeCategoryKey(recipe.category || "Other") ===
        normalizeCategoryKey(selectedCategory);
      const recipeDietaryType = getRecipeDietaryType(recipe);
      const dietaryMatch = selectedDietaryType === "All" || 
        (selectedDietaryType === "Vegetarian" && recipeDietaryType === "Vegetarian") ||
        (selectedDietaryType === "Non-Vegetarian" && recipeDietaryType === "Non-Vegetarian") ||
        (selectedDietaryType === "Other" && recipeDietaryType === "Other");
      return categoryMatch && dietaryMatch;
    }
  );

  return (
    <div className="main-content">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#2d3748',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #a8edea 50%, #fed6e3 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.5rem'
        }}>
          Delicious Recipes
        </h1>
        <p style={{ color: '#718096', fontSize: '1.1rem' }}>
          Discover and share amazing recipes from around the world
        </p>
        
        <div className="navigation-buttons" style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => setActiveView("all")}
            className={`nav-btn nav-btn-all ${activeView === 'all' ? 'active' : ''}`}
            style={{ marginRight: '1rem' }}
          >
            All Recipes
          </button>
          <button 
            onClick={() => setActiveView("category")}
            className={`nav-btn nav-btn-category ${activeView === 'category' ? 'active' : ''}`}
            style={{ marginRight: '1rem' }}
          >
            Category
          </button>
          <button 
            onClick={() => setActiveView("ordered")}
            className={`nav-btn nav-btn-ordered ${activeView === 'ordered' ? 'active' : ''}`}
          >
            Ordered Recipes ({orderedRecipes.length})
          </button>
        </div>
      </div>
      
      {activeView === "all" ? (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search recipes by name, ingredients, or keywords..."
              value={searchKey}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="recipe-instruction">
            <p>Tap the Information Button View full recipe details</p>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading recipes...</p>
              </div>
            </div>
          ) : (
            <>
              {loadError && (
                <div className="empty-state" style={{ marginBottom: "1rem" }}>
                  <h3>Could not load recipes</h3>
                  <p>{loadError}</p>
                  <button className="submit-order-btn" type="button" onClick={fetchRecipes}>
                    Retry
                  </button>
                </div>
              )}

              <div className="recipe-list">
                {filteredByDietary.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onAddFavorite={handleAddFavorite}
                    onOrderRecipe={handleOrderRecipe}
                    onViewInfo={handleViewInfo}
                    showOwnerActions={isRecipeOwner(recipe)}
                    canManageRecipe={true}
                    onEditRecipe={handleEditOpen}
                    onDeleteRecipe={handleDelete}
                    onCloseRecipe={handleCloseRecipeCard}
                  />
                ))}
              </div>
              
              {filteredByDietary.length === 0 && (
                <div className="empty-state">
                  <h3>No recipes found</h3>
                  <p>Try adjusting your search, dietary filter, or add a new recipe!</p>
                </div>
              )}
            </>
          )}
        </>
      ) : activeView === "category" ? (
        <>
          <div className="category-filter-wrap">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-filter-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedDietaryType("All");
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {!selectedCategory ? (
            <div className="empty-state">
              <h3>Select a category</h3>
              <p>Click any category above to view recipes.</p>
            </div>
          ) : (
            <>
              <div className="category-filter-wrap" style={{ marginTop: "0.75rem" }}>
                {[
                  { label: "All", value: "All" },
                  { label: "Veg", value: "Vegetarian" },
                  { label: "Non Veg", value: "Non-Vegetarian" },
                ].map((dietType) => (
                  <button
                    key={dietType.value}
                    type="button"
                    className={`category-filter-btn ${selectedDietaryType === dietType.value ? "active" : ""}`}
                    onClick={() => setSelectedDietaryType(dietType.value)}
                  >
                    {dietType.label}
                  </button>
                ))}
              </div>

              <div className="recipe-instruction">
                <p>Tap the Information Button View full recipe details</p>
              </div>

              <div className="recipe-list">
                {filteredCategoryRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onAddFavorite={handleAddFavorite}
                    onOrderRecipe={handleOrderRecipe}
                    onViewInfo={handleViewInfo}
                    showOwnerActions={isRecipeOwner(recipe)}
                    canManageRecipe={true}
                    onEditRecipe={handleEditOpen}
                    onDeleteRecipe={handleDelete}
                    onCloseRecipe={handleCloseRecipeCard}
                  />
                ))}
              </div>

              {filteredCategoryRecipes.length === 0 && (
                <div className="empty-state">
                  <h3>No recipes in {selectedCategory}</h3>
                  <p>
                    No {selectedDietaryType === "All" ? "" : `${selectedDietaryType} `}
                    recipes found in this category.
                  </p>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="ordered-recipes">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2d3748' }}>
            Your Ordered Recipes
          </h2>
          
          {orderedRecipes.length === 0 ? (
            <div className="empty-state">
              <h3>No ordered recipes yet</h3>
              <p>Start ordering recipes to see them here!</p>
            </div>
          ) : (
            <div className="recipe-list">
              {orderedRecipes.map((recipe) => (
                <div key={recipe._id} className="ordered-recipe-card">
                  <div className="recipe-image">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.title} />
                    ) : (
                      <div className="placeholder-image">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="recipe-content">
                    <h3>{recipe.title}</h3>
                    <p className="recipe-description">{recipe.description}</p>
                    
                    {/* Order Information */}
                    <div className="order-details">
                      <h4>📋 Order Information</h4>
                      <div className="order-info-grid">
                        <div className="info-item">
                          <span className="info-label">Name:</span>
                          <span className="info-value">{recipe.orderInfo.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{recipe.orderInfo.phone}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Date:</span>
                          <span className="info-value">{recipe.orderInfo.orderDate}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Time:</span>
                          <span className="info-value">{recipe.orderInfo.orderTime}</span>
                        </div>
                      </div>
                      
                      {/* Payment Information */}
                      <div className="payment-info">
                        <div className="payment-method-badge">
                          💳 {recipe.orderInfo.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                        </div>
                        <div className={`payment-status ${recipe.orderInfo.paymentStatus.toLowerCase()}`}>
                          {recipe.orderInfo.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="recipe-actions">
                      <button 
                        onClick={() => handleDeleteOrder(recipe._id)}
                        className="delete-order-btn"
                      >
                        🗑️ Delete Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ToastContainer />
      
      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay">
          <div className="order-modal">
            <div className="modal-header">
              <h3>Order Recipe: {selectedRecipe?.title}</h3>
              <button onClick={handleModalClose} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  value={orderInfo.name}
                  onChange={(e) => setOrderInfo({...orderInfo, name: e.target.value})}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  value={orderInfo.phone}
                  onChange={(e) => setOrderInfo({...orderInfo, phone: e.target.value})}
                  placeholder="Enter your 10-digit phone number"
                  className="form-input"
                  maxLength="10"
                />
              </div>
              <div className="form-group">
                <label>Payment Method:</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={orderInfo.paymentMethod === "cash"}
                      onChange={(e) => setOrderInfo({...orderInfo, paymentMethod: e.target.value})}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💵</span>
                      <span className="payment-text">
                        <strong>Cash on Delivery</strong>
                        <small>Pay when you receive your order</small>
                      </span>
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={orderInfo.paymentMethod === "online"}
                      onChange={(e) => setOrderInfo({...orderInfo, paymentMethod: e.target.value})}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💳</span>
                      <span className="payment-text">
                        <strong>Online Payment</strong>
                        <small>Pay now with secure payment gateway</small>
                      </span>
                    </span>
                  </label>
                </div>
                {orderInfo.paymentMethod === "online" && (
                  <div className="payment-info">
                    <p><strong>💡 Online Payment Options:</strong></p>
                    <ul>
                      <li>Credit/Debit Card (Visa, Mastercard, Rupay)</li>
                      <li>UPI (Google Pay, PhonePe, Paytm)</li>
                      <li>Net Banking</li>
                      <li>Digital Wallets</li>
                    </ul>
                    <p className="security-note">
                      🔒 Secure payment powered by industry-standard encryption
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleModalClose} className="cancel-btn">Cancel</button>
              <button onClick={handleOrderSubmit} className="submit-order-btn">Submit Order</button>
            </div>
          </div>
        </div>
      )}

      {showInfoModal && infoRecipe && (
        <div className="modal-overlay" onClick={closeInfoModal}>
          <div className="order-modal info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Recipe Information</h3>
              <button onClick={closeInfoModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="info-modal-title-row">
                <h4>{infoRecipe.title}</h4>
              </div>

              {infoRecipe.imageUrl ? (
                <img
                  src={infoRecipe.imageUrl}
                  alt={infoRecipe.title}
                  className="info-modal-image"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallbackTried) {
                      e.currentTarget.dataset.fallbackTried = "1";
                      e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(infoRecipe.title)}/900/600`;
                      return;
                    }
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/900x600/e2e8f0/334155?text=Recipe+Image";
                  }}
                />
              ) : (
                <div className="info-modal-image placeholder-image">
                  <span>No Image</span>
                </div>
              )}

              <div className="recipe-info info-modal-meta">
                <span>Prep Time: {infoRecipe.prepTime || 0} min</span>
                <span>Cost: ₹{infoRecipe.price || 0}</span>
              </div>

              {infoRecipe.description && (
                <div className="info-modal-section">
                  <h5>Description</h5>
                  <p>{infoRecipe.description}</p>
                </div>
              )}

              {Array.isArray(infoRecipe.ingredients) && infoRecipe.ingredients.length > 0 && (
                <div className="info-modal-section">
                  <h5>Ingredients</h5>
                  <ul>
                    {infoRecipe.ingredients.map((ingredient, index) => (
                      <li key={`${infoRecipe._id}-ing-${index}`}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}

              {infoRecipe.instructions && (
                <div className="info-modal-section">
                  <h5>Instructions</h5>
                  <p>{infoRecipe.instructions}</p>
                </div>
              )}

            </div>
            <div className="modal-footer">
              {/* Share Button - Opens Modal */}
              <button
                onClick={() => handleShareOpen(infoRecipe)}
                className="share-btn"
                title="Share this recipe"
              >
                Share
              </button>
              
              {/* Temporarily show edit/delete for debugging */}
              <button
                onClick={() => {
                  closeInfoModal();
                  handleEditOpen(infoRecipe);
                }}
                className="submit-order-btn action-edit"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  closeInfoModal();
                  handleDelete(infoRecipe._id);
                }}
                className="cancel-btn action-delete"
              >
                Delete
              </button>
              
              <button onClick={closeInfoModal} className="cancel-btn action-close">Close</button>
            </div>

            <div className="modal-reviews-section">
              <div className="info-modal-section">
                <h5>Reviews and Comments</h5>
                {Array.isArray(infoRecipe.reviews) && infoRecipe.reviews.length > 0 ? (
                  <div className="reviews-list">
                    {infoRecipe.reviews
                      .slice()
                      .reverse()
                      .map((review, index) => (
                        <div key={`${infoRecipe._id}-review-${index}`} className="review-item">
                          <div className="review-item-header">
                            <strong>{review.userName || "User"}</strong>
                            <span className="rating-stars">{renderStars(review.rating)}</span>
                          </div>
                          <p>{review.comment}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>No reviews yet. Be the first to comment.</p>
                )}

                <div className="review-form">
                  <label htmlFor="review-rating">Your Rating</label>
                  <select
                    id="review-rating"
                    className="form-input"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, rating: e.target.value }))
                    }
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>

                  <label htmlFor="review-comment">Your Comment</label>
                  <textarea
                    id="review-comment"
                    className="form-input"
                    rows="3"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Write your review here"
                  />

                  <button type="button" className="submit-review-btn" onClick={handleReviewSubmit}>
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editRecipe && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="order-modal edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Recipe</h3>
              <button onClick={closeEditModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-title">Title</label>
                <input
                  id="edit-title"
                  className="form-input"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditFormChange("title", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  className="form-input"
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange("description", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  className="form-input"
                  value={editForm.category}
                  onChange={(e) => handleEditFormChange("category", e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-dietary-type">Dietary Type</label>
                <select
                  id="edit-dietary-type"
                  className="form-input"
                  value={editForm.recipeType}
                  onChange={(e) => handleEditFormChange("recipeType", e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-image">Image URL</label>
                <input
                  id="edit-image"
                  className="form-input"
                  type="text"
                  value={editForm.imageUrl}
                  onChange={(e) => handleEditFormChange("imageUrl", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-prep-time">Prep Time (minutes)</label>
                <input
                  id="edit-prep-time"
                  className="form-input"
                  type="number"
                  min="0"
                  value={editForm.prepTime}
                  onChange={(e) => handleEditFormChange("prepTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-price">Cost</label>
                <input
                  id="edit-price"
                  className="form-input"
                  type="number"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => handleEditFormChange("price", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-ingredients">Ingredients (comma separated)</label>
                <textarea
                  id="edit-ingredients"
                  className="form-input"
                  rows="3"
                  value={editForm.ingredientsText}
                  onChange={(e) => handleEditFormChange("ingredientsText", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-instructions">Instructions</label>
                <textarea
                  id="edit-instructions"
                  className="form-input"
                  rows="5"
                  value={editForm.instructions}
                  onChange={(e) => handleEditFormChange("instructions", e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeEditModal} className="cancel-btn">Cancel</button>
              <button onClick={handleEditSubmit} className="submit-order-btn">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareRecipe && (
        <div className="modal-overlay" onClick={closeShareModal}>
          <div className="order-modal share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Recipe: {shareRecipe.title}</h3>
              <button onClick={closeShareModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="share-modal-content">
                <div className="share-recipe-info">
                  <h4>{shareRecipe.title}</h4>
                  <p>{shareRecipe.description}</p>
                </div>
                
                <div className="social-media-buttons">
                  <button
                    onClick={() => handleShare('whatsapp', shareRecipe)}
                    className="social-btn whatsapp-btn"
                    title="Share on WhatsApp"
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('instagram', shareRecipe)}
                    className="social-btn instagram-btn"
                    title="Share on Instagram"
                  >
                    📸 Instagram
                  </button>
                  <button
                    onClick={() => handleShare('facebook', shareRecipe)}
                    className="social-btn facebook-btn"
                    title="Share on Facebook"
                  >
                    📘 Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter', shareRecipe)}
                    className="social-btn twitter-btn"
                    title="Share on Twitter"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin', shareRecipe)}
                    className="social-btn linkedin-btn"
                    title="Share on LinkedIn"
                  >
                    � LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('pinterest', shareRecipe)}
                    className="social-btn pinterest-btn"
                    title="Share on Pinterest"
                  >
                    📌 Pinterest
                  </button>
                  <button
                    onClick={() => handleShare('reddit', shareRecipe)}
                    className="social-btn reddit-btn"
                    title="Share on Reddit"
                  >
                    🎯 Reddit
                  </button>
                  <button
                    onClick={() => handleShare('telegram', shareRecipe)}
                    className="social-btn telegram-btn"
                    title="Share on Telegram"
                  >
                    ✈️ Telegram
                  </button>
                  <button
                    onClick={() => handleShare('easy-share', shareRecipe)}
                    className="social-btn easy-share-btn"
                    title="Easy Share"
                  >
                    🚀 Easy Share
                  </button>
                  <button
                    onClick={() => handleShare('copy', shareRecipe)}
                    className="social-btn copy-btn"
                    title="Copy Link"
                  >
                    � Copy Link
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeShareModal} className="cancel-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
