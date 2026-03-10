#!/bin/bash
# 自动保存脚本 - 每5分钟检查一次

while true; do
    sleep 300  # 5分钟

    # 检查是否有未提交的修改
    if ! git diff --quiet; then
        git add -A
        git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Auto-saved at $(date)"
    fi
done
