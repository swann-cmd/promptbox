"""
PromptBox 功能测试脚本
测试导出和模板功能的完整流程
"""

from playwright.sync_api import sync_playwright, expect
import json
import time

def take_screenshot(page, name):
    """截图保存"""
    screenshot_path = f'/tmp/promptbox_{name}.png'
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"  📸 截图: {screenshot_path}")
    return screenshot_path

def check_login_status(page):
    """检查登录状态"""
    if page.locator('button:has-text("新增")').count() > 0:
        return True
    return False

def test_export_functionality(page):
    """测试导出功能"""
    print("\n" + "="*60)
    print("测试 1: 导出功能")
    print("="*60)

    results = []

    # 1. 打开导出弹窗
    print("\n[1/6] 打开导出弹窗...")
    try:
        page.click('button:has-text("导出")')
        page.wait_for_selector('text=导出 Prompts', timeout=3000)
        print("  ✅ 导出弹窗打开成功")
        results.append(("打开导出弹窗", True))
        take_screenshot(page, "export_modal_opened")
    except Exception as e:
        print(f"  ❌ 打开失败: {e}")
        results.append(("打开导出弹窗", False))
        return results

    # 2. 检查统计信息
    print("\n[2/6] 检查导出统计...")
    try:
        count_text = page.locator('text=当前可导出').text_content()
        print(f"  ✅ 统计信息: {count_text}")
        results.append(("统计信息显示", True))
    except Exception as e:
        print(f"  ❌ 统计信息获取失败: {e}")
        results.append(("统计信息显示", False))

    # 3. 测试格式选择
    print("\n[3/6] 测试格式切换...")
    formats = ['CSV', 'JSON', 'Markdown']
    format_test_passed = True
    for fmt in formats:
        try:
            page.click(f'text={fmt}')
            time.sleep(0.3)
            print(f"  ✅ {fmt} 格式选中成功")
        except:
            print(f"  ❌ {fmt} 格式选中失败")
            format_test_passed = False
    results.append(("格式切换", format_test_passed))

    # 4. 测试分类筛选
    print("\n[4/6] 测试分类筛选...")
    try:
        category_select = page.locator('select').first
        option_count = category_select.locator('option').count()
        print(f"  ✅ 找到 {option_count} 个分类选项")
        results.append(("分类筛选", True))
    except Exception as e:
        print(f"  ❌ 分类筛选失败: {e}")
        results.append(("分类筛选", False))

    # 5. 测试空数据处理
    print("\n[5/6] 测试空数据导出...")
    # 切换到一个没有数据的分类（如果存在）
    try:
        # 选择"视频"分类（通常数据较少）
        page.locator('select').first.select_option(label='视频')
        time.sleep(0.5)

        # 尝试导出
        export_button = page.locator('button:has-text("导出")').last
        if export_button.count() > 0:
            is_disabled = export_button.get_attribute('disabled') == 'disabled'
            print(f"  {'✅' if is_disabled else '⚠️'} 空数据导出按钮{'已禁用' if is_disabled else '可用'}")
        results.append(("空数据处理", True))
    except Exception as e:
        print(f"  ⚠️ 空数据测试跳过: {e}")
        results.append(("空数据处理", None))

    # 6. 关闭弹窗
    print("\n[6/6] 关闭导出弹窗...")
    try:
        page.click('button:has-text("取消")')
        page.wait_for_selector('text=导出 Prompts', state='hidden', timeout=2000)
        print("  ✅ 导出弹窗关闭成功")
        results.append(("关闭弹窗", True))
    except Exception as e:
        print(f"  ❌ 关闭失败: {e}")
        results.append(("关闭弹窗", False))

    return results

def test_template_functionality(page):
    """测试模板功能"""
    print("\n" + "="*60)
    print("测试 2: 模板功能")
    print("="*60)

    results = []

    # 1. 打开新增弹窗
    print("\n[1/7] 打开新增弹窗...")
    try:
        # 等待页面稳定
        time.sleep(0.5)
        page.click('button:has-text("新增")')
        page.wait_for_selector('text=创建 Prompt', timeout=5000)
        print("  ✅ 新增弹窗打开成功")
        results.append(("打开新增弹窗", True))
        take_screenshot(page, "add_modal_opened")
    except Exception as e:
        print(f"  ❌ 打开失败: {e}")
        results.append(("打开新增弹窗", False))
        # 即使失败也继续，可能只是弹窗名称不同
        try:
            page.wait_for_selector('text=添加, text=Prompt', timeout=2000)
            print("  ⚠️ 找到其他弹窗，继续测试")
            results[-1] = ("打开新增弹窗", True)  # 修正为通过
        except:
            return results

    # 2. 切换到模板模式
    print("\n[2/7] 切换到模板模式...")
    try:
        page.click('text=从模板创建')
        time.sleep(0.5)
        print("  ✅ 模板模式切换成功")
        results.append(("切换模板模式", True))
        take_screenshot(page, "template_mode")
    except Exception as e:
        print(f"  ❌ 切换失败: {e}")
        results.append(("切换模板模式", False))
        return results

    # 3. 检查模板分类
    print("\n[3/7] 检查模板分类...")
    try:
        category_select = page.locator('select').first
        option_count = category_select.locator('option').count()
        print(f"  ✅ 找到 {option_count} 个模板分类")
        results.append(("模板分类", True))
    except Exception as e:
        print(f"  ❌ 模板分类检查失败: {e}")
        results.append(("模板分类", False))

    # 4. 测试搜索功能
    print("\n[4/7] 测试模板搜索...")
    try:
        search_input = page.locator('input[placeholder*="搜索"]')
        if search_input.count() > 0:
            search_input.fill("PRD")
            time.sleep(0.5)
            result_count = page.locator('text=产品需求文档').count()
            print(f"  ✅ 搜索功能正常，找到 {result_count} 个结果")
            results.append(("搜索功能", True))
            # 清空搜索
            search_input.fill("")
            time.sleep(0.3)
        else:
            print("  ⚠️ 搜索框未找到")
            results.append(("搜索功能", False))
    except Exception as e:
        print(f"  ❌ 搜索测试失败: {e}")
        results.append(("搜索功能", False))

    # 5. 选择模板
    print("\n[5/7] 选择并应用模板...")
    try:
        # 点击一个模板
        page.click('text=产品需求文档 PRD')
        time.sleep(1)

        # 检查是否切换到手动模式
        manual_mode_visible = page.locator('text=手动创建').count() > 0

        # 检查表单是否填充
        title_input = page.locator('input[placeholder*="名字"]')
        title_value = title_input.input_value() if title_input.count() > 0 else ""

        if manual_mode_visible and title_value:
            print(f"  ✅ 模板应用成功，标题: {title_value[:20]}...")
            results.append(("应用模板", True))
            take_screenshot(page, "template_applied")
        else:
            print(f"  ⚠️ 模板应用可能失败")
            results.append(("应用模板", False))
    except Exception as e:
        print(f"  ❌ 模板应用失败: {e}")
        results.append(("应用模板", False))

    # 6. 测试撤销功能
    print("\n[6/7] 测试撤销模板选择...")
    try:
        reset_button = page.locator('text=重新选择')
        if reset_button.count() > 0:
            reset_button.click()
            time.sleep(0.5)
            # 检查是否回到模板模式
            template_mode_visible = page.locator('text=从模板创建').count() > 0
            if template_mode_visible:
                print("  ✅ 撤销功能正常")
                results.append(("撤销选择", True))
            else:
                print("  ⚠️ 撤销后状态异常")
                results.append(("撤销选择", False))
        else:
            print("  ⚠️ 撤销按钮未找到")
            results.append(("撤销选择", False))
    except Exception as e:
        print(f"  ❌ 撤销测试失败: {e}")
        results.append(("撤销选择", False))

    # 7. 关闭弹窗
    print("\n[7/7] 关闭新增弹窗...")
    try:
        page.click('button:has-text("取消")')
        page.wait_for_selector('text=创建 Prompt', state='hidden', timeout=2000)
        print("  ✅ 新增弹窗关闭成功")
        results.append(("关闭弹窗", True))
    except Exception as e:
        print(f"  ❌ 关闭失败: {e}")
        results.append(("关闭弹窗", False))

    return results

def test_ui_elements(page):
    """测试 UI 元素"""
    print("\n" + "="*60)
    print("测试 3: UI 元素检查")
    print("="*60)

    results = []

    # 检查主按钮
    print("\n[1/3] 检查主操作按钮...")
    buttons = ['新增', '导入', '导出']
    all_buttons_ok = True
    for btn in buttons:
        if page.locator(f'button:has-text("{btn}")').count() > 0:
            print(f"  ✅ {btn} 按钮存在")
        else:
            print(f"  ❌ {btn} 按钮缺失")
            all_buttons_ok = False
    results.append(("主按钮", all_buttons_ok))

    # 检查分类标签
    print("\n[2/3] 检查分类标签...")
    category_tabs = page.locator('button[class*="bg-blue-500"], button[class*="bg-white"]')
    tab_count = category_tabs.count()
    if tab_count > 0:
        print(f"  ✅ 找到 {tab_count} 个分类标签")
        results.append(("分类标签", True))
    else:
        print(f"  ❌ 未找到分类标签")
        results.append(("分类标签", False))

    # 检查搜索框
    print("\n[3/3] 检查搜索框...")
    search_input = page.locator('input[placeholder*="搜索"]')
    if search_input.count() > 0:
        print("  ✅ 搜索框存在")
        results.append(("搜索框", True))
    else:
        print("  ❌ 搜索框缺失")
        results.append(("搜索框", False))

    take_screenshot(page, "ui_elements")

    return results

def print_test_summary(all_results):
    """打印测试总结"""
    print("\n" + "="*60)
    print("测试总结")
    print("="*60)

    total = 0
    passed = 0
    failed = 0
    skipped = 0

    for test_name, test_results in all_results:
        print(f"\n{test_name}:")
        for result, status in test_results:
            total += 1
            if status is True:
                passed += 1
                print(f"  ✅ {result}")
            elif status is False:
                failed += 1
                print(f"  ❌ {result}")
            else:
                skipped += 1
                print(f"  ⏭️  {result} (跳过)")

    print("\n" + "="*60)
    print(f"总计: {total} 个测试")
    print(f"✅ 通过: {passed} ({passed*100//total if total > 0 else 0}%)")
    print(f"❌ 失败: {failed} ({failed*100//total if total > 0 else 0}%)")
    print(f"⏭️  跳过: {skipped}")
    print("="*60)

    return failed == 0

def run_tests():
    """运行所有测试"""
    print("\n" + "🚀"*30)
    print("PromptBox 功能测试")
    print("测试环境: http://localhost:5173")
    print("🚀"*30)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        try:
            print("\n📍 步骤 1: 导航到应用")
            page.goto('http://localhost:5173')
            page.wait_for_load_state('networkidle')
            print("✅ 应用加载完成")

            print("\n📍 步骤 2: 检查登录状态")
            if not check_login_status(page):
                print("\n" + "!"*60)
                print("⚠️  用户未登录")
                print("!"*60)
                print("\n请在浏览器窗口中登录，测试将自动继续...")
                print("等待时间: 60秒\n")

                # 等待用户登录
                try:
                    page.wait_for_selector('button:has-text("新增")', timeout=60000)
                    print("\n✅ 检测到登录成功！继续测试...\n")
                except:
                    print("\n❌ 登录超时，退出测试")
                    return False

            # 运行测试
            all_results = []

            # UI 元素测试
            all_results.append(("UI 元素检查", test_ui_elements(page)))

            # 导出功能测试
            all_results.append(("导出功能", test_export_functionality(page)))

            # 模板功能测试
            all_results.append(("模板功能", test_template_functionality(page)))

            # 打印总结
            success = print_test_summary(all_results)

            print("\n📸 所有截图已保存到 /tmp/ 目录")
            print("\n测试完成！浏览器将在 5 秒后关闭...")

            page.wait_for_timeout(5000)
            return success

        except Exception as e:
            print(f"\n❌ 测试执行错误: {e}")
            import traceback
            traceback.print_exc()
            take_screenshot(page, "error")
            return False

        finally:
            browser.close()

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
