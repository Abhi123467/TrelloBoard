import React, { useEffect, useState } from "react";
import "./EditModal.css";

const BASE_URL = "https://backend-krtj.onrender.com";

function EditModal({ cardId, onClose, onUpdate }) {
  const [text, setText] = useState("");
  const [comment, setComment] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [cardImageFile, setCardImageFile] = useState(null);
  const [cardImagePreview, setCardImagePreview] = useState(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [removeCardImage, setRemoveCardImage] = useState(false);
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await fetch(`${BASE_URL}/cards/${cardId}`);
        const data = await res.json();
        setText(data.text);
        setComment(data.comment || "");
        setDescription(data.description || "");
        if (data.cover_image_url) {
          setCoverImagePreview(`${BASE_URL}/${data.cover_image_url}`);
        }
        if (data.card_image_url) {
          setCardImagePreview(`${BASE_URL}/${data.card_image_url}`);
        }
      } catch (error) {
        console.error("Error loading card:", error);
      }
    };

    if (cardId) fetchCard();
  }, [cardId]);

  const saveChanges = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    const formData = new FormData();
    formData.append("text", text);
    formData.append("comment", comment);
    formData.append("description", description);
    
    if (coverImageFile) {
      formData.append("cover_image", coverImageFile);
    }
    if (cardImageFile) {
      formData.append("card_image", cardImageFile);
    }
    if (removeCoverImage) {
      formData.append("remove_cover_image", "true");
    }
    if (removeCardImage) {
      formData.append("remove_card_image", "true");
    }

    try {
      const res = await fetch(`${BASE_URL}/cards/${cardId}`, {
        method: "PUT",
        body: formData,
      });
      if (res.ok) {
        onUpdate(); // Trigger parent component update
      }
    } catch (err) {
      console.error("Error updating card:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) saveChanges();
    }, 1000);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (comment !== undefined) saveChanges();
    }, 1000);
    return () => clearTimeout(timer);
  }, [comment]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (description !== undefined) saveChanges();
    }, 1000);
    return () => clearTimeout(timer);
  }, [description]);

  useEffect(() => {
    if (coverImageFile || removeCoverImage || cardImageFile || removeCardImage) {
      saveChanges();
    }
  }, [coverImageFile, removeCoverImage, cardImageFile, removeCardImage]);

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    setCoverImageFile(file);
    setRemoveCoverImage(false);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
    setShowCoverMenu(false);
  };

  const handleCardImageChange = (e) => {
    const file = e.target.files[0];
    setCardImageFile(file);
    setRemoveCardImage(false);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCardImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
    setShowCardMenu(false);
  };

  const handleRemoveCoverImageClick = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setRemoveCoverImage(true);
    setShowCoverMenu(false);
  };

  const handleRemoveCardImageClick = () => {
    setCardImageFile(null);
    setCardImagePreview(null);
    setRemoveCardImage(true);
    setShowCardMenu(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="image-section">
          <h4>Cover Image</h4>
          {coverImagePreview ? (
            <div className="image-container">
              <img src={coverImagePreview} alt="Cover" className="image-preview" />
              <div className="image-actions">
                <button 
                  className="menu-toggle" 
                  onClick={() => setShowCoverMenu(!showCoverMenu)}
                >
                  ⋮
                </button>
                {showCoverMenu && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item">
                      <label>
                        Change Cover Image
                        <input type="file" accept="image/*" onChange={handleCoverImageChange} hidden />
                      </label>
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={handleRemoveCoverImageClick} 
                      style={{ backgroundColor: "red" }}
                    >
                      Remove Cover Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="image-placeholder">
              <label className="add-image-btn">
                + Add Cover Image
                <input type="file" accept="image/*" onChange={handleCoverImageChange} hidden />
              </label>
            </div>
          )}
        </div>

        <label htmlFor="card-name">Card Name:</label>
        <input
          type="text"
          id="card-name"
          className="modal-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter card name"
        />

        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          className="modal-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter your comment"
          rows="3"
        />

        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          className="modal-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed description"
          rows="5"
        />

        <div className="image-section">
          <h4>Attachment</h4>
          {cardImagePreview ? (
            <div className="image-container">
              <img src={cardImagePreview} alt="Card" className="image-preview" />
              <div className="image-actions">
                <button 
                  className="menu-toggle" 
                  onClick={() => setShowCardMenu(!showCardMenu)}
                >
                  ⋮
                </button>
                {showCardMenu && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item">
                      <label>
                        Change Attachment
                        <input type="file" accept="image/*" onChange={handleCardImageChange} hidden />
                      </label>
                    </button>
                    <button 
                      className="dropdown-item" 
                      style={{ backgroundColor: "red" }}
                      onClick={handleRemoveCardImageClick}
                    >
                      Remove Attachment
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="image-placeholder">
              <label className="add-image-btn">
                + Add Attachment
                <input type="file" accept="image/*" onChange={handleCardImageChange} hidden />
              </label>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;