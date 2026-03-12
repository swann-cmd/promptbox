import { useState } from "react";

const MAX_TAGS = 10;

/**
 * Custom hook for managing tag input and state
 * Used in DetailModal and PublishModal
 */
function useTagManager(initialTags = []) {
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState("");

  const addTag = (newTag) => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < MAX_TAGS) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
      return true;
    }
    return false;
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleKeyDown,
    canAddMore: tags.length < MAX_TAGS,
    remaining: MAX_TAGS - tags.length,
  };
}

export { useTagManager, MAX_TAGS };
