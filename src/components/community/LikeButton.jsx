import { HeartIcon } from "../ui/icons";
import { toggleLike } from "../../utils/community";
import ToggleButton from "../ui/ToggleButton";

/**
 * 点赞按钮组件（含乐观更新）
 */
function LikeButton({ communityPromptId, initialLiked = false, initialLikeCount = 0, size = "md", onLikeChange }) {
  return (
    <ToggleButton
      icon={HeartIcon}
      apiCall={() => toggleLike(communityPromptId)}
      initialState={initialLiked}
      count={initialLikeCount}
      size={size}
      activeColor="red"
      onChange={(payload) => {
        if (onLikeChange) onLikeChange({ communityPromptId, ...payload });
      }}
      title={initialLiked ? "取消点赞" : "点赞"}
    />
  );
}

export default LikeButton;
