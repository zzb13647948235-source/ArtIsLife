#!/bin/bash

echo "=========================================="
echo "  上传到腾讯云服务器"
echo "=========================================="
echo ""
echo "服务器: 119.29.84.36"
echo "文件: dist-update-20260302-183331.tar.gz"
echo "大小: 265MB"
echo ""
echo "请输入服务器密码进行上传..."
echo ""

# 上传压缩包
scp dist-update-20260302-183331.tar.gz root@119.29.84.36:/root/

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ 上传成功！"
    echo ""
    echo "接下来请执行以下命令登录服务器并解压："
    echo ""
    echo "ssh root@119.29.84.36"
    echo ""
    echo "然后在服务器上执行："
    echo "cd /root/artislife  # 或你的实际网站目录"
    echo "tar -xzf /root/dist-update-20260302-183331.tar.gz"
    echo "rm -rf dist.old && mv dist dist.old  # 备份旧版本"
    echo "mv dist-update-20260302-183331/dist ."
    echo "pm2 restart all  # 重启服务"
    echo "rm /root/dist-update-20260302-183331.tar.gz  # 清理压缩包"
else
    echo ""
    echo "✗ 上传失败"
    echo ""
    echo "请手动使用 WinSCP 或 FileZilla 上传文件"
fi
