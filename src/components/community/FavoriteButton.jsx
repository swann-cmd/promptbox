import { StarIcon } from "../ui/icons";
import { toggleFavorite } from "../../utils/community";
import ToggleButton from "../ui/ToggleButton";

/**
 * 收藏按钮组件（含乐观更新）
 */
function FavoriteButton({ communityPromptId, initialFavorited = false, size = "md", onFavoriteChange }) {
  return (
    <ToggleButton
      icon={StarIcon}
      apiCall={() => toggleFavorite(communityPromptId)}
      initialState={initialFavorited}
      size={size}
      activeColor="amber"
      onChange={onFavoriteChange}
      title={initialFavorited ? "取消收藏" : "收藏"}
    />
  );
}

export default FavoriteButton;
