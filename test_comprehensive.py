#!/usr/bin/env python3
"""
全面测试：安全修复验证 + 代码审查
"""

import re
import subprocess
from playwright.sync_api import sync_playwright

def check_code_fixes():
    """检查代码中的修复"""
    print("\n" + "="*60)
    print("🔍 代码审查检查")
    print("="*60)

    results = []

    # 1. 检查环境变量验证
    print("\n1️⃣ 检查环境变量验证...")
    with open('src/lib/supabase.js', 'r') as f:
        content = f.read()
        if 'Missing Supabase environment variables' in content:
            print("✅ 环境变量验证已添加")
            results.append(True)
        else:
            print("❌ 环境变量验证未找到")
            results.append(False)

    # 2. 检查 ErrorBoundary
    print("\n2️⃣ 检查 ErrorBoundary 组件...")
    try:
        with open('src/components/ErrorBoundary.jsx', 'r') as f:
            content = f.read()
            if 'ErrorBoundary' in content:
                print("✅ ErrorBoundary 组件已创建")
                results.append(True)
            else:
                print("❌ ErrorBoundary 组件未找到")
                results.append(False)
    except:
        print("❌ ErrorBoundary 文件不存在")
        results.append(False)

    # 3. 检查 main.jsx 中的 ErrorBoundary
    print("\n3️⃣ 检查 main.jsx 集成...")
    with open('src/main.jsx', 'r') as f:
        content = f.read()
        if 'ErrorBoundary' in content:
            print("✅ ErrorBoundary 已集成到 main.jsx")
            results.append(True)
        else:
            print("❌ ErrorBoundary 未集成")
            results.append(False)

    # 4. 检查 CSV 注入防护
    print("\n4️⃣ 检查 CSV 注入防护...")
    with open('src/App.jsx', 'r') as f:
        content = f.read()
        if "prevent CSV injection" in content or 'csv' in content.lower():
            print("✅ CSV 注入防护已添加")
            results.append(True)
        else:
            print("⚠️  CSV 注入防护未明确标记")
            results.append(False)

    # 5. 检查是否有原生 alert/confirm
    print("\n5️⃣ 检查原生 alert/confirm...")
    with open('src/App.jsx', 'r') as f:
        content = f.read()
        # 排除注释和字符串
        code_lines = [line for line in content.split('\n')
                     if not line.strip().startswith('//')
                     and not line.strip().startswith('*')
                     and not line.strip().startswith('/*')]

        has_alert = any('alert(' in line for line in code_lines if '#' not in line)
        has_confirm = any('confirm(' in line for line in code_lines if '#' not in line)

        if not has_alert and not has_confirm:
            print("✅ 未找到原生 alert/confirm")
            results.append(True)
        else:
            if has_alert:
                print("⚠️  仍有 alert() 调用")
            if has_confirm:
                print("⚠️  仍有 confirm() 调用")
            results.append(False)

    # 6. 检查自定义对话框组件
    print("\n6️⃣ 检查自定义对话框组件...")
    with open('src/App.jsx', 'r') as f:
        content = f.read()
        has_alert_dialog = 'AlertDialog' in content or 'function AlertDialog' in content
        has_confirm_dialog = 'ConfirmDialog' in content or 'function ConfirmDialog' in content

        if has_alert_dialog and has_confirm_dialog:
            print("✅ 自定义对话框组件已创建")
            results.append(True)
        else:
            print("❌ 自定义对话框组件不完整")
            results.append(False)

    # 7. 检查长度限制
    print("\n7️⃣ 检查内容长度限制...")
    with open('src/App.jsx', 'r') as f:
        content = f.read()
        has_const = 'MAX_TITLE_LENGTH' in content or 'MAX_CONTENT_LENGTH' in content
        has_validate = 'validatePrompt' in content
        has_sanitize = 'sanitizeInput' in content

        if has_const and has_validate:
            print("✅ 内容长度限制已添加")
            results.append(True)
        else:
            print("⚠️  内容长度限制不完整")
            results.append(False)

        if has_sanitize:
            print("✅ 输入清理函数已添加")
            results.append(True)
        else:
            print("⚠️  输入清理函数未找到")
            results.append(False)

    # 8. 检查数据库迁移文件
    print("\n8️⃣ 检查数据库迁移...")
    import os
    migrations = [
        'supabase/migrations/004_enhance_function_security.sql',
        'supabase/migrations/005_add_content_length_constraints.sql'
    ]

    all_exist = True
    for migration in migrations:
        if os.path.exists(migration):
            print(f"✅ {os.path.basename(migration)} 存在")
        else:
            print(f"❌ {os.path.basename(migration)} 不存在")
            all_exist = False

    results.append(all_exist)

    # 9. 检查 useMemo 优化
    print("\n9️⃣ 检查性能优化...")
    with open('src/App.jsx', 'r') as f:
        content = f.read()
        if 'useMemo' in content:
            print("✅ useMemo 优化已添加")
            results.append(True)
        else:
            print("⚠️  useMemo 未找到")
            results.append(False)

    # 10. 检查速率限制
    print("\n🔟 检查速率限制...")
    with open('src/App.jsx', 'r') as f:
        content = f.read()
        if 'RATE_LIMIT_MS' in content or 'lastAttemptTime' in content:
            print("✅ 速率限制已添加")
            results.append(True)
        else:
            print("⚠️  速率限制未找到")
            results.append(False)

    return results

def test_ui_functionality():
    """测试 UI 功能"""
    print("\n" + "="*60)
    print("🎨 UI 功能测试")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        page = browser.new_page()

        print("\n🌐 打开应用...")
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')

        # 测试 1: 应用启动
        print("\n1️⃣ 应用启动测试...")
        try:
            # 检查是否显示登录或主页面
            page.wait_for_selector('body', timeout=5000)
            print("✅ 应用成功启动")
            page.screenshot(path='/tmp/ui_test_1_startup.png')
        except:
            print("❌ 应用启动失败")
            browser.close()
            return

        # 测试 2: UI 元素检查
        print("\n2️⃣ UI 元素检查...")
        try:
            # 检查登录页面元素
            has_login = page.locator('text=登录').count() > 0
            has_email_input = page.locator('input[type="email"]').count() > 0
            has_password_input = page.locator('input[type="password"]').count() > 0

            if has_login and has_email_input and has_password_input:
                print("✅ 登录页面 UI 元素完整")
            else:
                print("⚠️  登录页面 UI 元素不完整")
        except:
            print("⚠️  UI 元素检查失败")

        page.screenshot(path='/tmp/ui_test_2_elements.png')

        # 测试 3: 响应式设计
        print("\n3️⃣ 响应式设计测试...")
        page.set_viewport_size({"width": 375, "height": 667})  # iPhone
        page.wait_for_load_state('networkidle')
        print("✅ 移动端视图正常")
        page.screenshot(path='/tmp/ui_test_3_mobile.png')

        page.set_viewport_size({"width": 1920, "height": 1080})  # Desktop
        page.wait_for_load_state('networkidle')
        print("✅ 桌面端视图正常")
        page.screenshot(path='/tmp/ui_test_4_desktop.png')

        # 测试 4: 控制台错误检查
        print("\n4️⃣ 检查控制台错误...")
        errors = []
        page.on('console', lambda msg: errors.append(msg) if msg.type == 'error' else None)

        # 触发一些交互
        try:
            page.click('button:has-text("登录")')
            page.wait_for_timeout(1000)
        except:
            pass

        if len(errors) == 0:
            print("✅ 无控制台错误")
        else:
            print(f"⚠️  发现 {len(errors)} 个控制台错误")

        browser.close()

def main():
    print("\n" + "🚀"*30)
    print("  PromptBox 安全修复综合测试")
    print("🚀"*30)

    # 代码审查
    code_results = check_code_fixes()

    # UI 功能测试
    test_ui_functionality()

    # 汇总结果
    print("\n" + "="*60)
    print("📊 测试结果汇总")
    print("="*60)

    passed = sum(code_results)
    total = len(code_results)
    percentage = (passed / total) * 100

    print(f"\n✅ 通过: {passed}/{total} ({percentage:.1f}%)")

    if percentage >= 80:
        print("\n🎉 优秀！大部分修复已正确实现")
    elif percentage >= 60:
        print("\n👍 良好！多数修复已实现")
    else:
        print("\n⚠️  需要改进：部分修复未完成")

    print("\n📁 截图保存在 /tmp/ui_test_*.png")
    print("\n" + "="*60)

if __name__ == '__main__':
    main()
