#!/bin/bash

# 部署脚本 - 上传到腾讯云服务器
# 使用方法: bash deploy.sh

SERVER="root@119.29.84.36"
REMOTE_PATH="/root/artislife"  # 请根据实际路径修改
LOCAL_DIST="./dist"

echo "开始部署到腾讯云服务器..."
echo "服务器地址: $SERVER"
echo "远程路径: $REMOTE_PATH"

# 1. 构建生产版本
echo "正在构建生产版本..."
npm run build

if [ $? -ne 0 ]; then
    echo "构建失败，请检查错误信息"
    exit 1
fi

echo "构建完成！"

# 2. 使用 rsync 同步文件（推荐）
echo "正在上传文件到服务器..."
rsync -avz --progress --delete \
    -e "ssh -i ~/.ssh/id_ed25519" \
    $LOCAL_DIST/ $SERVER:$REMOTE_PATH/dist/

if [ $? -eq 0 ]; then
    echo "✓ 部署成功！"
    echo "网站地址: http://119.29.84.36"
else
    echo "✗ 部署失败，请检查SSH连接"
    echo ""
    echo "如果SSH连接失败，请手动上传："
    echo "1. 使用FTP/SFTP工具（如FileZilla）"
    echo "2. 连接到 119.29.84.36"
    echo "3. 上传 dist/ 文件夹中的所有内容"
fi
