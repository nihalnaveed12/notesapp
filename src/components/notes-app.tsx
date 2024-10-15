"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { FilePenIcon, TrashIcon } from "lucide-react";


type Notes = {
  id: number; // notes id type
  title: string; // title type
  content: string; // content type
};

// initial values
const defaultNotes: Notes[] = [
  {
    id: 1,
    title: "Grociery",
    content: "All Grociery Items",
  },
  {
    id: 2,
    title: "Meeting Notes",
    content: "Discuss new project timeline, assign tasks to team",
  },
  {
    id: 3,
    title: "Idea for App",
    content: "Develop a note-taking app with a clean and minimalist design",
  },
];

// notes ko local storage me save krnay ke liya custom hook

function useLocalStorage<T>(key: string, initialValue: T) {
  const getLocalStorage = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("ERROR", error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getLocalStorage);

  useEffect(() => {
    setStoredValue(getLocalStorage);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("ERROR", error);
    }
  };

  return [storedValue, setValue] as const;
}

function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Notes[]>("notes", defaultNotes);
  const [newNote, setNewNote] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddNote = (): void => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const newNoteWithId = { id: Date.now(), ...newNote };
      setNotes([newNoteWithId , ...notes]);
      setNewNote({ title: "", content: "" });
    }
  };

  const handleEdit = (id: number): void => {
    const noteId = notes.find((note) => note.id === id);
    if (noteId) {
      setNewNote({ title: noteId.title, content: noteId.content });
      setEditingNoteId(id);
    }
  };

  const handleUpdateNote = (): void => {
    if (newNote.title.trim() && newNote.content.trim()) {
      setNotes(
        notes.map((note) =>
          editingNoteId === note.id
            ? { id: note.id, title: newNote.title, content: newNote.content }
            : note
        )
      );
    }

    setNewNote({title: "", content:""})
    setEditingNoteId(null)
  };

  const handleDeleteNote = (id:number): void => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  if(!isMounted) {
    return null
  }
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-zinc-800 text-zinc-50 p-4 shadow">
        <h1 className="text-2xl font-bold">Note Taker</h1>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title || ""}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            placeholder="Content"
            value={newNote.content || ""}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            className="mt-2 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
          />
          {editingNoteId === null ? (
            <Button onClick={handleAddNote} className="mt-2">
              Add Note
            </Button>
          ) : (
            <Button onClick={handleUpdateNote} className="mt-2">
              Update Note
            </Button>
          )}
        </div>
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{note.title}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(note.id)}
                    className="hover:bg-zinc-800 hover:text-zinc-50 "
                  >
                    <FilePenIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                    className="hover:bg-zinc-800 hover:text-zinc-50 "
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">{note.content}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
  

export default NotesApp;
