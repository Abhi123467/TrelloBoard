import React, { useEffect, useState, useRef } from "react";
import "./index.css";
import EditModal from "./EditModal";

const BASE_URL = "https://backend-krtj.onrender.com";

function App() {
  const [lists, setLists] = useState([]);
  const [showListInput, setShowListInput] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [cardInputs, setCardInputs] = useState({});
  const [newCardTexts, setNewCardTexts] = useState({});
  const [editingListId, setEditingListId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardText, setEditingCardText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalCardId, setModalCardId] = useState(null);
  const [modalListId, setModalListId] = useState(null);
  const titleInputRef = useRef(null);

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newListTitle }),
      });
      if (response.ok) {
        setNewListTitle("");
        setShowListInput(false);
        fetchLists();
      }
    } catch (error) {
      console.error("Error adding list:", error);
    }
  };

  const handleUpdateList = async (listId) => {
    if (!editingTitle.trim()) return;
    try {
      const response = await fetch(`${BASE_URL}/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      if (response.ok) {
        setEditingListId(null);
        fetchLists();
      }
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      const response = await fetch(`${BASE_URL}/lists/${listId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLists();
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const handleAddCard = async (listId) => {
    const text = newCardTexts[listId]?.trim();
    if (!text) return;
    try {
      const response = await fetch(`${BASE_URL}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ list_id: listId, text }),
      });
      if (response.ok) {
        setNewCardTexts((prev) => ({ ...prev, [listId]: "" }));
        setCardInputs((prev) => ({ ...prev, [listId]: false }));
        fetchLists();
      }
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      const response = await fetch(`${BASE_URL}/cards/${cardId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLists();
      }
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  const openEditModal = (listId, cardId) => {
    setModalCardId(cardId);
    setModalListId(listId);
    setShowModal(true);
  };

  const closeEditModal = () => {
    setShowModal(false);
    setModalCardId(null);
    setModalListId(null);
  };

  const fetchLists = async () => {
    try {
      const response = await fetch(`${BASE_URL}/lists`);
      const data = await response.json();
      const updatedData = data.map((list) => ({
        ...list,
        showMenu: false,
        cards: list.cards || [],
      }));
      setLists(updatedData);
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (editingListId && titleInputRef.current && !titleInputRef.current.contains(e.target)) {
        handleUpdateList(editingListId);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingListId, editingTitle]);

  return (
    <div className="task-board">
      <h2 className="board-title">Trello Board</h2>
      <div className="lists-container">
        {lists.map((list) => (
          <div key={list.id} className="list">
            <div className="list-header">
              {editingListId === list.id ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  className="input-field"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateList(list.id);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <h4
                    className="list-title"
                    onClick={() => {
                      setEditingListId(list.id);
                      setEditingTitle(list.title);
                    }}
                  >
                    {list.title}
                  </h4>
                  <div style={{ position: "relative" }}>
                    <button
                      className="list-menu-btn"
                      onClick={() =>
                        setLists((prev) =>
                          prev.map((l) =>
                            l.id === list.id ? { ...l, showMenu: !l.showMenu } : { ...l, showMenu: false }
                          )
                        )
                      }
                    >
                      ⋮
                    </button>
                    {list.showMenu && (
                      <div className="list-menu">
                        <button
                          onClick={() => {
                            setEditingListId(list.id);
                            setEditingTitle(list.title);
                            setLists((prev) =>
                              prev.map((l) => ({ ...l, showMenu: false }))
                            );
                          }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteList(list.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {list.cards?.map((card) => (
              <div 
                key={card.id} 
                className="card"
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.card-delete-btn').style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.card-delete-btn').style.display = 'none';
                }}
              >
                {card.cover_image_url && (
                  <div className="card-cover">
                    <img 
                      src={`${BASE_URL}/${card.cover_image_url}`} 
                      alt="Cover" 
                      className="card-cover-image"
                    />
                  </div>
                )}
                <div className="card-content" onClick={() => openEditModal(list.id, card.id)}>
                  {card.text}
                </div>
                <button
                  className="card-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                >
                  ❌
                </button>
              </div>
            ))}

            {cardInputs[list.id] ? (
              <>
                <input
                  type="text"
                  className="input-field"
                  value={newCardTexts[list.id] || ""}
                  onChange={(e) =>
                    setNewCardTexts((prev) => ({ ...prev, [list.id]: e.target.value }))
                  }
                  placeholder="Enter card text"
                />
                <button className="save-btn" onClick={() => handleAddCard(list.id)}>
                  Add Card
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setCardInputs((prev) => ({ ...prev, [list.id]: false }))}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="add-card-btn"
                onClick={() => setCardInputs((prev) => ({ ...prev, [list.id]: true }))}
              >
                + Add a card
              </button>
            )}
          </div>
        ))}

        <div>
          {showListInput ? (
            <div className="list">
              <input
                type="text"
                className="input-field"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title"
                autoFocus
              />
              <button className="save-btn" onClick={handleAddList}>
                Add List
              </button>
              <button className="cancel-btn" onClick={() => setShowListInput(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="add-list-btn" onClick={() => setShowListInput(true)}>
              + Add another list
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <EditModal
          cardId={modalCardId}
          onClose={closeEditModal}
          onUpdate={fetchLists}
        />
      )}
    </div>
  );
}

export default App;