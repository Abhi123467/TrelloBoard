import React, { useEffect, useState, useRef } from "react";
import "./index.css";

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

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    const response = await fetch(`${BASE_URL}/lists`);
    const data = await response.json();
    const updatedData = data.map((list) => ({ 
      ...list, 
      showMenu: false,
      cards: list.cards?.map(card => ({ ...card, showMenu: false })) || [] 
    }));
    setLists(updatedData);
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    await fetch(`${BASE_URL}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newListTitle }),
    });
    setNewListTitle("");
    setShowListInput(false);
    fetchLists();
  };

  const handleAddCard = async (listId) => {
    const text = newCardTexts[listId];
    if (!text?.trim()) return;

    await fetch(`${BASE_URL}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ list_id: listId, text }),
    });

    setNewCardTexts((prev) => ({ ...prev, [listId]: "" }));
    setCardInputs((prev) => ({ ...prev, [listId]: false }));
    fetchLists();
  };

  const handleEditCard = async (cardId) => {
    if (editingCardText?.trim()) {
      await fetch(`${BASE_URL}/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingCardText }),
      });
      setEditingCardId(null);
      setEditingCardText("");
      fetchLists();
    }
  };

  const handleDeleteCard = async (cardId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this card?");
    if (confirmDelete) {
      await fetch(`${BASE_URL}/cards/${cardId}`, {
        method: "DELETE",
      });
      fetchLists();
    }
  };

  const saveEditedTitle = async () => {
    if (editingTitle?.trim()) {
      await fetch(`${BASE_URL}/lists/${editingListId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle }),
      });
      setEditingListId(null);
      setEditingTitle("");
      fetchLists();
    } else {
      setEditingListId(null);
    }
  };

  const handleDeleteList = async (listId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this list?");
    if (confirmDelete) {
      await fetch(`${BASE_URL}/lists/${listId}`, {
        method: "DELETE",
      });
      fetchLists();
    }
  };

  const toggleCardMenu = (listId, cardId) => {
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            cards: list.cards.map(card => {
              if (card.id === cardId) {
                return { ...card, showMenu: !card.showMenu };
              }
              return { ...card, showMenu: false };
            })
          };
        }
        return list;
      })
    );
  };

  const titleInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editingListId &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target)
      ) {
        saveEditedTitle();
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
              <div key={card.id} className="card">
                {editingCardId === card.id ? (
                  <>
                    <input
                      type="text"
                      className="input-field"
                      value={editingCardText}
                      onChange={(e) => setEditingCardText(e.target.value)}
                    />
                    <button className="save-btn" onClick={() => handleEditCard(card.id)}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <div className="card-content">{card.text}</div>
                    <button
                      className="card-menu-btn"
                      onClick={() => toggleCardMenu(list.id, card.id)}
                    >
                      ⋮
                    </button>
                    {card.showMenu && (
                      <div className="card-menu">
                        <button
                          onClick={() => {
                            setEditingCardId(card.id);
                            setEditingCardText(card.text);
                            toggleCardMenu(list.id, card.id);
                          }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCard(card.id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
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
              <button
                className="cancel-btn"
                onClick={() => setShowListInput(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="add-list-btn"
              onClick={() => setShowListInput(true)}
            >
              + Add another list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;