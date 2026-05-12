// ===================== 新手可修改区：模板与对应归档文件夹 =====================
// 配置规则："你的模板文件名（不含.md后缀）": { folders: ["对应归档文件夹路径"] }
const templateConfig = {
    "Paper": {
        folders: ["Bases/Papers"]
    }
};

// 兜底文件夹：目标文件夹不存在时，自动把笔记存到这里
const defaultFolder = "Temp";
// 你的模板存放文件夹，和前面创建的保持一致
const templateRootFolder = "OBProjConfig/Templates";
// ==============================================================================

module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const { suggester, inputPrompt } = quickAddApi;

    try {
        // 1. 自动获取所有匹配的模板文件
        const allFiles = app.vault.getFiles();
        const templateNameList = Object.keys(templateConfig);
        const templateFiles = allFiles.filter(file =>
            file.path.startsWith(templateRootFolder + "/") &&
            templateNameList.includes(file.basename) &&
            file.extension === "md"
        );

        if (!templateFiles || templateFiles.length === 0) {
            new Notice("❌ 未找到模板文件，请确认模板放在00模板文件夹里");
            return;
        }

        // 2. 第一步：选择要使用的模板
        const selectedTemplate = await suggester(
            templateFiles.map(file => file.basename),
            templateFiles,
            false,
            "【第一步】请选择要使用的模板"
        );
        if (!selectedTemplate) {
            new Notice("⚠️ 已取消创建笔记");
            return;
        }

        // 3. 第二步：选择笔记存放的文件夹
        const templateName = selectedTemplate.basename;
        const availableFolders = templateConfig[templateName].folders;
        let targetFolder = availableFolders[0];

        if (availableFolders.length > 1) {
            const selectedFolder = await suggester(
                availableFolders,
                availableFolders,
                false,
                "【第二步】请选择笔记的存放文件夹"
            );
            if (!selectedFolder) {
                new Notice("⚠️ 已取消创建笔记");
                return;
            }
            targetFolder = selectedFolder;
        }

        // 4. 第三步：输入笔记的自定义名称
        const customName = await inputPrompt(
            "【第三步】请输入笔记的自定义名称",
            "请输入笔记名称"
        );
        if (!customName || customName.trim() === "") {
            new Notice("⚠️ 笔记名称不能为空，已取消创建");
            return;
        }

        // 5. 生成标准化文件名：年-月-日-自定义名称
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayDate = `${month}-${day}`;
        const finalFileName = `${customName.trim()}.md`;

        // 6. 自动创建不存在的文件夹，避免报错
        let targetFolderObj = app.vault.getAbstractFileByPath(targetFolder);
        if (!targetFolderObj) {
            await app.vault.createFolder(targetFolder);
            targetFolderObj = app.vault.getAbstractFileByPath(targetFolder);
            new Notice(` 自动创建目标文件夹：${targetFolder}`);
        }

        // 7. 读取模板内容，创建新笔记并自动归档
        const templateContent = await app.vault.read(selectedTemplate);
        const newNote = await app.vault.create(
            `${targetFolder + "/" + finalFileName}`,
            templateContent
        );

        // 8. 自动打开新创建的笔记
        const activeLeaf = app.workspace.getLeaf(false);
        if (activeLeaf && newNote) {
            await activeLeaf.openFile(newNote);
            app.workspace.setActiveLeaf(activeLeaf, { focus: true });
        }

        new Notice(`✅ 笔记创建成功！已保存至：${finalFileName}`);

    } catch (error) {
        new Notice(`❌ 执行出错：${error.message}`);
        console.error("脚本报错详情：", error);
        return;
    }
};