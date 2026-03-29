import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const RecipeCard = ({
  recipe,
  onAddFavorite,
  onOrderRecipe,
  onViewInfo,
  showOwnerActions = false,
  onEditRecipe,
  onDeleteRecipe,
  onCloseRecipe,
}) => {
  const [liked, setLiked] = useState(recipe.liked || false);
  const token = localStorage.getItem("token");
  const shareDropdownRef = useRef(null);

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

  const handleLike = async () => {
    if (!token) {
      toast.error("Please login to like recipes");
      return;
    }

    try {
      await onAddFavorite(recipe._id);
      setLiked(!liked);
    } catch (error) {
      toast.error("Error: " + error.message);
    }
  };

  const handleOrder = () => {
    onOrderRecipe && onOrderRecipe(recipe._id);
  };

  const handleViewInfo = () => {
    onViewInfo && onViewInfo(recipe._id);
  };

  const handleEdit = () => {
    onEditRecipe && onEditRecipe(recipe);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
      try {
        await onDeleteRecipe(recipe._id);
        toast.success("Recipe deleted successfully!");
      } catch (error) {
        toast.error("Error deleting recipe: " + error.message);
      }
    }
  };

  const handleClose = () => {
    onCloseRecipe && onCloseRecipe(recipe._id);
  };

  const handleShare = (platform) => {
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
      case 'copy':
        navigator.clipboard.writeText(`${recipeTitle} - ${recipeDescription} ${recipeUrl}`);
        toast.success('Recipe link copied to clipboard! 📋');
        return;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Generate unique image based on recipe title and category
  const getRecipeImage = (title, category) => {
    // Category-specific image mappings
    const categoryImages = {
      'South Indian': [
        'https://images.unsplash.com/photo-1586198042591-1e01951899e4?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'North Indian': [
        'https://images.unsplash.com/photo-1567620905732-2be1df8e1b13?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-15569090060-2ea0d616cd5a?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Andhra': [
        'https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Karnataka': [
        'https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Street Food': [
        'https://images.unsplash.com/photo-1562927766784-a94b38427bfa?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1565296769-eda4af9c0f1c85?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1563379044-de8904b3f760?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Breakfast': [
        'https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1534422278144-9e3e26a456d?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1517684633826-c9dbcefe8d2a?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Snacks': [
        'https://images.unsplash.com/photo-1562927766784-a94b38427bfa?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1565296769-eda4af9c0f1c85?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1608140546789-21e699a624e7?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Desserts': [
        'https://images.unsplash.com/photo-1551024506-2dba5fb3ce89?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1563726618619-4d4ec0abe952?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-15588056-1a68a025b87b?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Beverages': [
        'https://images.unsplash.com/photo-1544145975478-73e0ae6705e8?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1534409138602-4e69212579d84?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1544145975478-73e0ae6705e8?w=900&h=600&fit=crop&crop=center&auto=format'
      ],
      'Other': [
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1563379044-de8904b3f760?w=900&h=600&fit=crop&crop=center&auto=format'
      ]
    };

    // Name-specific image matching
    const titleLower = title.toLowerCase();
    let selectedImage = null;

    // Try to find specific recipe name matches
    if (titleLower.includes('maggi') || titleLower.includes('noodles')) {
      selectedImage = 'https://images.unsplash.com/photo-1617093726264-f4e8540b15e2?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('pizza')) {
      selectedImage = 'https://images.unsplash.com/photo-1593561210423-2e684e6aaa2b?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('burger') || titleLower.includes('sandwich')) {
      selectedImage = 'https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('biryani') || titleLower.includes('rice')) {
      selectedImage = 'https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('samosa')) {
      selectedImage = 'https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('dosa')) {
      selectedImage = 'https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('idli')) {
      selectedImage = 'https://images.unsplash.com/photo-1621996326569-e11d875d5482?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('vada')) {
      selectedImage = 'https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('paneer')) {
      selectedImage = 'https://images.unsplash.com/photo-1585033865114-f50f0e930e2?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('curry') || titleLower.includes('sabji')) {
      selectedImage = 'https://images.unsplash.com/photo-1567620905732-2be1df8e1b13?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('roti')) {
      selectedImage = 'https://images.unsplash.com/photo-1568905110939-01b71b8b77c3?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('paratha')) {
      selectedImage = 'https://images.unsplash.com/photo-1505252589542-88e5e848d1a5?w=900&h=600&fit=crop&crop=center&auto=format';
    } else if (titleLower.includes('chaat')) {
      selectedImage = 'https://images.unsplash.com/photo-1563379044-de8904b3f760?w=900&h=600&fit=crop&crop=center&auto=format';
    }

    // If no specific match, use category-based image
    if (!selectedImage && category && categoryImages[category]) {
      const categoryImages = categoryImages[category];
      const categoryIndex = title.length % categoryImages.length;
      selectedImage = categoryImages[categoryIndex];
    }

    // Final fallback to general food images
    if (!selectedImage) {
      const generalFoodImages = [
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1563379044-de8904b3f760?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1565296769-eda4af9c0f1c85?w=900&h=600&fit=crop&crop=center&auto=format',
        'https://images.unsplash.com/photo-1512621776957-07b118fe262f?w=900&h=600&fit=crop&crop=center&auto=format'
      ];
      const fallbackIndex = title.length % generalFoodImages.length;
      selectedImage = generalFoodImages[fallbackIndex];
    }

    return selectedImage || 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&h=600&fit=crop&crop=center&auto=format';
  };

  return (
    <div
      className="recipe-card"
      onClick={handleViewInfo}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleViewInfo();
        }
      }}
    >
      <div className="recipe-image">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            onError={(e) => {
              if (!e.currentTarget.dataset.fallbackTried) {
                e.currentTarget.dataset.fallbackTried = "1";
                e.currentTarget.src = getRecipeImage(recipe.title, recipe.category);
                return;
              }
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/900x600/e2e8f0/334155?text=Recipe+Image";
            }}
          />
        ) : (
          <div className="placeholder">
            <img 
              src={getRecipeImage(recipe.title, recipe.category)}
              alt={recipe.title}
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/900x600/e2e8f0/334155?text=Recipe+Image";
              }}
            />
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>
        <p className="recipe-description">{recipe.description}</p>
        <div className="recipe-info">
          <span className="recipe-category">{recipe.category}</span>
          <span className="recipe-time">{recipe.prepTime || 0} min</span>
          <span className="recipe-price">₹{recipe.price || 0}</span>
        </div>
      </div>
      <div className="recipe-actions">
        <button
          className={`like-btn ${liked ? "liked" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          title={liked ? "Unlike" : "Like"}
        >
          {liked ? "❤️" : "🤍"}
        </button>
        
        <button
          className="info-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleViewInfo();
          }}
          title="View full recipe information"
        >
          Information
        </button>
        
        <button
          className="order-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleOrder();
          }}
          title="Order this recipe"
        >
          Order Now
        </button>
        
        {showOwnerActions && (
          <>
            <button
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              title="Edit this recipe"
            >
              Edit
            </button>
            
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title="Delete this recipe"
            >
              Delete
            </button>
            
            <button
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              title="Hide this recipe"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
