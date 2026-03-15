// ==UserScript==
// @name         [Template] Keywords Search Enhanced [20260315] v1.0.1
// @namespace    0_V userscripts/[Keywords Search Enhanced] Template
// @description  Shared runtime template for the Keywords Search Enhanced site wrappers.
// @version      [20260315] v1.0.1
// @update-log   Restore original modal footer button styles
//
// @grant        none
//
// @icon         https://github.com/0-V-linuxdo/-YouTube-Keywords-Search-Enhanced/raw/refs/heads/main/assets/main_icon.svg
// ==/UserScript==

/* ===================== SHARED TEMPLATE · NOTICE · START =====================
 *
 * [编辑指引 | Edit Guidance]
 *   • 共享 runtime 请修改 `src/template/`。
 *   • 站点差异配置请修改 `src/sites/<site>/`。
 *   • 运行 `npm run build` 只会重新生成 `dist/` 下的模板和站点包装脚本。
 *
 * [安全提示 | Safety Reminder]
 *   • 优先使用 DOM 节点拼装和 `textContent`，不要直接拼接用户输入的 HTML。
 *
 * ====================== SHARED TEMPLATE · NOTICE · END ====================== */

(function initKSETemplateRuntime(global) {
    'use strict';

    const TEMPLATE_VERSION = '[20260315] v1.0.1';
    const bootstrappedSites = global.__KSE_TEMPLATE_BOOTSTRAPPED__ || (global.__KSE_TEMPLATE_BOOTSTRAPPED__ = new Set());

    function deepClone(value) {
        return value == null ? value : JSON.parse(JSON.stringify(value));
    }

    function toTrimmedString(value) {
        return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    }

    function parseStoredJson(rawValue) {
        if (!rawValue) {
            return null;
        }

        if (typeof rawValue === 'string') {
            try {
                return JSON.parse(rawValue);
            } catch {
                return null;
            }
        }

        return typeof rawValue === 'object' ? rawValue : null;
    }

    function createNamedUrlEntry(label, url) {
        return {
            label: toTrimmedString(label),
            url: toTrimmedString(url)
        };
    }

    function getFilterOption(filterConfig, groupId, optionId) {
        return filterConfig?.[groupId]?.options?.find(option => option.id === optionId) || null;
    }

    function getBaseStyles(namespace, extraStyles = '') {
        return `
        .${namespace}-content-container {
            --container-bg: #ffffff;
            --container-border: #d1d5db;
            --text-color: #111827;
            --muted-text: #6b7280;
            --code-bg: #f8fafc;
            --code-border: #d1d5db;
            --code-color: #1f2937;
            --code-active-bg: #eef2f7;
            --modal-bg: #ffffff;
            --list-bg: #ffffff;
            --item-bg: #ffffff;
            --item-border: #d1d5db;
            --item-text: #1f2937;
            --input-border: #d1d5db;
            --input-bg: #ffffff;
            --input-text: #111827;
            --button-bg: #111827;
            --button-text: #ffffff;
            --button-icon-color: #374151;
            --button-hover-bg: #000000;
            --hover-bg: rgba(15, 23, 42, 0.06);
            --backdrop-bg: rgba(15, 23, 42, 0.46);
            --focus-outline: 2px solid rgba(15, 23, 42, 0.18);
            --badge-text: #ffffff;
            --tab-track-bg: #f3f4f6;
            --tab-track-border: #d1d5db;
            --tab-active-bg: #111827;
            --tab-active-text: #ffffff;
            --tab-hover-bg: #e5e7eb;
            --tab-muted-text: #4b5563;
            --danger-bg: #dc2626;
            --danger-hover-bg: #b91c1c;
            --notification-bg: rgba(17, 24, 39, 0.94);
            --notification-text: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: var(--text-color);
        }

        @media (prefers-color-scheme: dark) {
            .${namespace}-content-container {
                --container-bg: #111318;
                --container-border: #313844;
                --text-color: #f5f7fb;
                --muted-text: rgba(245, 247, 251, 0.72);
                --code-bg: #191d24;
                --code-border: #313844;
                --code-color: #f5f7fb;
                --code-active-bg: #252b35;
                --modal-bg: #111318;
                --list-bg: #111318;
                --item-bg: #161a20;
                --item-border: #313844;
                --item-text: #f5f7fb;
                --input-border: #374151;
                --input-bg: #171b22;
                --input-text: #f5f7fb;
                --button-bg: #f5f7fb;
                --button-text: #111827;
                --button-icon-color: #f5f7fb;
                --button-hover-bg: #e5e7eb;
                --hover-bg: rgba(255, 255, 255, 0.08);
                --backdrop-bg: rgba(0, 0, 0, 0.72);
                --focus-outline: 2px solid rgba(255, 255, 255, 0.24);
                --tab-track-bg: #1b1f26;
                --tab-track-border: #313844;
                --tab-active-bg: #f5f7fb;
                --tab-active-text: #111827;
                --tab-hover-bg: #252b35;
                --tab-muted-text: rgba(245, 247, 251, 0.78);
                --notification-bg: rgba(243, 244, 246, 0.94);
                --notification-text: #111827;
            }
        }

        .${namespace}-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 1150;
            display: none;
            background: var(--backdrop-bg);
            opacity: 0;
            transition: opacity 0.24s ease;
        }

        .${namespace}-keyword-search-container {
            display: none;
            position: relative;
            width: 100%;
            max-height: 75vh;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 10px 16px 16px;
            border: 1px solid var(--container-border);
            border-radius: 14px;
            background: var(--container-bg);
            color: var(--text-color);
            box-sizing: border-box;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.16);
            transform: scale(0.95);
            opacity: 0;
            transition: transform 0.24s ease, opacity 0.24s ease;
        }

        .${namespace}-panel-tab-container,
        .${namespace}-tab-container {
            display: grid;
            gap: 3px;
            padding: 3px;
            border: 1px solid var(--tab-track-border);
            border-radius: 14px;
            background: var(--tab-track-bg);
            box-sizing: border-box;
        }

        .${namespace}-panel-tab-button,
        .${namespace}-tab-button {
            min-width: 0;
            min-height: 32px;
            padding: 0 14px;
            border: none !important;
            border-radius: 10px;
            background: transparent !important;
            color: var(--tab-muted-text) !important;
            cursor: pointer;
            font-size: 13px;
            font-weight: 700;
            line-height: 1;
            letter-spacing: 0.01em;
            white-space: nowrap;
            transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
            appearance: none;
            -webkit-appearance: none;
            box-sizing: border-box;
        }

        .${namespace}-panel-tab-button:hover:not(.${namespace}-active-tab),
        .${namespace}-tab-button:hover:not(.${namespace}-active-tab) {
            background: var(--tab-hover-bg) !important;
            color: var(--text-color) !important;
            transform: translateY(-1px);
        }

        .${namespace}-panel-tab-button.${namespace}-active-tab,
        .${namespace}-tab-button.${namespace}-active-tab {
            background: var(--tab-active-bg) !important;
            color: var(--tab-active-text) !important;
            transform: translateY(-1px);
        }

        .${namespace}-panel-tab-button:focus-visible,
        .${namespace}-tab-button:focus-visible,
        .${namespace}-icon-btn:focus-visible,
        .${namespace}-settings-btn:focus-visible,
        .${namespace}-tag-main-action:focus-visible,
        .${namespace}-modern-input:focus-visible,
        .${namespace}-edit-filter-select:focus-visible,
        .${namespace}-settings-select:focus-visible,
        .${namespace}-sync-modal-close-btn:focus-visible {
            outline: var(--focus-outline);
            outline-offset: 2px;
        }

        .${namespace}-panel-tab-content-container,
        .${namespace}-tab-content-container {
            margin-top: 14px;
        }

        .${namespace}-panel-tab-content,
        .${namespace}-tab-content {
            display: none;
            flex-direction: column;
            gap: 18px;
            box-sizing: border-box;
        }

        .${namespace}-saved-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .${namespace}-panel-title {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
        }

        .${namespace}-tag-list {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 0;
            padding: 0;
        }

        .${namespace}-tag-item {
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 100%;
            padding: 5px 10px 5px 12px;
            border: 1px solid var(--code-border);
            border-radius: 20px;
            background: var(--code-bg);
            color: var(--code-color);
            box-sizing: border-box;
            transition: background 0.18s ease, transform 0.18s ease;
        }

        .${namespace}-tag-item:hover {
            background: var(--code-active-bg);
            transform: translateY(-1px);
        }

        .${namespace}-tag-main-action {
            display: flex;
            flex: 1;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
            min-width: 0;
            padding: 0;
            border: none;
            background: none;
            color: inherit;
            cursor: pointer;
            font: inherit;
            text-align: left;
            appearance: none;
            -webkit-appearance: none;
        }

        .${namespace}-tag-main-action:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .${namespace}-tag-main-label {
            min-width: 0;
            overflow-wrap: anywhere;
        }

        .${namespace}-tag-actions {
            display: flex;
            align-items: center;
            gap: 2px;
            flex-shrink: 0;
        }

        .${namespace}-tag-action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            min-width: 20px;
            min-height: 20px;
            padding: 0;
            border: none !important;
            border-radius: 6px;
            background: transparent;
            color: var(--button-icon-color);
            cursor: pointer;
            transition: background 0.18s ease, color 0.18s ease;
        }

        .${namespace}-tag-action-btn:hover {
            background: var(--hover-bg);
            color: var(--text-color);
        }

        .${namespace}-edit-tag-icon {
            font-size: 11px;
            font-weight: 700;
            line-height: 1;
            transform: translateY(-0.5px) scaleX(-1);
        }

        .${namespace}-filter-badge,
        .${namespace}-preview-badge,
        .${namespace}-option-preview-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 18px;
            padding: 0 8px;
            border-radius: 999px;
            color: var(--badge-text);
            font-size: 12px;
            line-height: 1.1;
            font-weight: 600;
            white-space: nowrap;
            box-sizing: border-box;
        }

        .${namespace}-preview-badge,
        .${namespace}-option-preview-badge {
            min-height: 16px;
            padding: 0 6px;
            font-size: 11px;
        }

        .${namespace}-tag-preview,
        .${namespace}-option-tag-preview {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 10px;
            border: 1px solid var(--code-border);
            border-radius: 20px;
            background: var(--code-bg);
            color: var(--code-color);
            box-sizing: border-box;
        }

        .${namespace}-sync-modal {
            position: absolute;
            top: 0;
            right: -40px;
            width: 220px;
            border: 1px solid var(--container-border);
            border-radius: 12px;
            background: var(--modal-bg);
            box-sizing: border-box;
            z-index: 1200;
            overflow: hidden;
        }

        .${namespace}-centered-modal {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            right: auto !important;
            width: 90vw !important;
            max-width: 520px !important;
            max-height: 90vh;
            transform: translate(-50%, -50%) !important;
            overflow-y: auto;
        }

        .${namespace}-edit-modal {
            z-index: 1250;
        }

        .${namespace}-keyword-edit-modal {
            max-width: 560px !important;
        }

        .${namespace}-sync-modal-content {
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
        }

        .${namespace}-sync-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 14px;
            border-bottom: 1px solid var(--container-border);
            box-sizing: border-box;
        }

        .${namespace}-sync-modal-header h2 {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
        }

        .${namespace}-sync-modal-close-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            min-height: 28px;
            padding: 0;
            border: none;
            background: none;
            color: var(--button-icon-color);
            font-size: 18px;
            line-height: 1;
            cursor: pointer;
        }

        .${namespace}-sync-modal-close-btn:hover {
            background: var(--hover-bg);
            border-radius: 8px;
        }

        .${namespace}-settings-modal-body,
        .${namespace}-edit-modal-body {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 14px;
            box-sizing: border-box;
        }

        .${namespace}-settings-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .${namespace}-settings-subtitle {
            margin: 0;
            font-size: 14px;
            font-weight: 700;
        }

        .${namespace}-filter-grid,
        .${namespace}-color-grid {
            display: grid;
            gap: 12px;
        }

        .${namespace}-edit-filter-groups {
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-sizing: border-box;
        }

        .${namespace}-filter-item,
        .${namespace}-settings-row,
        .${namespace}-edit-filter-group,
        .${namespace}-option-color-item,
        .${namespace}-color-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
        }

        .${namespace}-multi-select-item,
        .${namespace}-edit-features-group,
        .${namespace}-color-item {
            align-items: flex-start;
        }

        .${namespace}-settings-label,
        .${namespace}-option-settings-label {
            min-width: 120px;
            width: 120px;
            font-size: 14px;
            font-weight: 400;
            white-space: nowrap;
            text-align: left;
            flex-shrink: 0;
            box-sizing: border-box;
        }

        .${namespace}-edit-field-label,
        .${namespace}-edit-filter-label {
            font-size: 14px;
            box-sizing: border-box;
        }

        .${namespace}-edit-filter-label {
            min-width: 80px;
            width: 120px;
            font-weight: 400;
            white-space: nowrap;
            text-align: left;
        }

        .${namespace}-modern-input,
        .${namespace}-edit-filter-select,
        .${namespace}-settings-select {
            width: 100%;
            min-height: 42px;
            padding: 10px 14px;
            border: 1px solid var(--input-border);
            border-radius: 10px;
            background: var(--input-bg);
            color: var(--input-text);
            font: inherit;
            box-sizing: border-box;
        }

        .${namespace}-edit-filter-select,
        .${namespace}-settings-select {
            flex: 1;
            width: auto;
            max-width: 100%;
            min-height: 42px;
            padding: 8px;
            border: 1px solid var(--input-border);
            border-radius: 4px;
            background: var(--input-bg);
            color: var(--input-text);
            font: inherit;
            box-sizing: border-box;
        }

        .${namespace}-edit-filter-select,
        .${namespace}-settings-select {
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            padding-right: 24px;
        }

        .${namespace}-modern-input:focus,
        .${namespace}-edit-filter-select:focus,
        .${namespace}-settings-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.14);
        }

        .${namespace}-edit-field {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .${namespace}-checkbox-container,
        .${namespace}-edit-checkbox-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            flex: 1;
            max-height: 180px;
            overflow-y: auto;
            padding-right: 4px;
            box-sizing: border-box;
        }

        .${namespace}-checkbox-wrapper,
        .${namespace}-edit-checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .${namespace}-feature-checkbox,
        .${namespace}-edit-feature-checkbox {
            margin: 0;
            cursor: pointer;
        }

        .${namespace}-checkbox-label,
        .${namespace}-edit-checkbox-label {
            cursor: pointer;
        }

        .${namespace}-label-color-container,
        .${namespace}-options-color-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 100%;
        }

        .${namespace}-color-input,
        .${namespace}-option-color-input {
            width: 44px;
            height: 36px;
            padding: 0;
            border: 1px solid var(--container-border);
            border-radius: 10px;
            background: transparent;
            cursor: pointer;
        }

        .${namespace}-settings-footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            flex-wrap: wrap;
        }

        .${namespace}-settings-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 88px;
            min-height: 36px;
            padding: 0 14px;
            border: none !important;
            border-radius: 10px;
            cursor: pointer;
            font: inherit;
            font-weight: 700;
            transition: transform 0.18s ease, opacity 0.18s ease, background 0.18s ease;
            box-sizing: border-box;
        }

        .${namespace}-settings-btn:hover {
            transform: translateY(-1px);
        }

        .${namespace}-reset-btn {
            background: var(--hover-bg) !important;
            color: var(--text-color) !important;
        }

        .${namespace}-save-btn {
            background: var(--button-bg) !important;
            color: var(--button-text) !important;
        }

        .${namespace}-edit-delete-btn {
            margin-right: auto;
            background: var(--danger-bg) !important;
            color: #ffffff !important;
        }

        .${namespace}-edit-delete-btn:hover {
            background: var(--danger-hover-bg) !important;
        }

        .${namespace}-icon-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            min-width: 32px;
            min-height: 32px;
            border: 1px solid var(--container-border) !important;
            border-radius: 999px;
            background: var(--container-bg) !important;
            color: var(--button-icon-color);
            cursor: pointer;
            font-size: 16px;
            transition: background 0.18s ease, transform 0.18s ease;
            box-sizing: border-box;
        }

        .${namespace}-icon-btn:hover {
            background: var(--hover-bg) !important;
            transform: scale(1.06);
        }

        .${namespace}-sync-external-btn,
        .${namespace}-settings-external-btn,
        .${namespace}-add-external-btn,
        .${namespace}-import-export-btn {
            position: absolute;
            z-index: 1100;
            display: none;
        }

        .${namespace}-add-external-btn {
            font-size: 18px;
            font-weight: 700;
            line-height: 1;
        }

        .${namespace}-import-export-btn {
            opacity: 0;
            transform: translateY(-10px);
            transition: opacity 0.24s ease, transform 0.24s ease;
        }

        .${namespace}-notification {
            position: fixed;
            left: 50%;
            bottom: 20px;
            z-index: 2000;
            padding: 10px 18px;
            border-radius: 10px;
            background: var(--notification-bg);
            color: var(--notification-text);
            transform: translateX(-50%) translateY(120%);
            transition: transform 0.24s ease;
            box-sizing: border-box;
        }

        .${namespace}-notification-show {
            transform: translateX(-50%) translateY(0);
        }

        @media (max-width: 768px) {
            .${namespace}-keyword-search-container {
                padding: 10px 12px 14px;
            }

            .${namespace}-filter-item,
            .${namespace}-settings-row,
            .${namespace}-edit-filter-group,
            .${namespace}-option-color-item,
            .${namespace}-color-item {
                flex-direction: column;
                align-items: flex-start;
            }

            .${namespace}-settings-label,
            .${namespace}-option-settings-label,
            .${namespace}-edit-filter-label {
                min-width: 0;
                width: 100%;
            }

            .${namespace}-settings-select,
            .${namespace}-edit-filter-select {
                width: 100%;
                margin-top: 5px;
            }

            .${namespace}-sync-modal {
                right: -6px;
            }
        }

        ${extraStyles}
        `;
    }

    function validateSiteDefinition(siteDefinition) {
        if (!siteDefinition || typeof siteDefinition !== 'object') {
            throw new Error('[KSE Template] Invalid site definition.');
        }

        const requiredFields = ['siteId', 'namespace', 'templateVersion', 'menuCommandLabel', 'keyword', 'settings', 'dom', 'importExport'];
        requiredFields.forEach(fieldName => {
            if (!(fieldName in siteDefinition)) {
                throw new Error(`[KSE Template] Missing site definition field: ${fieldName}`);
            }
        });

        if (siteDefinition.templateVersion !== TEMPLATE_VERSION) {
            throw new Error(`[KSE Template] Version mismatch for ${siteDefinition.siteId}: expected ${TEMPLATE_VERSION}, got ${siteDefinition.templateVersion}`);
        }

        if (!siteDefinition.keyword?.collection?.storageKey) {
            throw new Error(`[KSE Template] Missing keyword storage key for ${siteDefinition.siteId}`);
        }

        if (!siteDefinition.settings?.storageKey || typeof siteDefinition.settings.normalize !== 'function' || typeof siteDefinition.settings.createModal !== 'function') {
            throw new Error(`[KSE Template] Incomplete settings contract for ${siteDefinition.siteId}`);
        }

        if (typeof siteDefinition.dom?.getSearchContext !== 'function') {
            throw new Error(`[KSE Template] Missing dom.getSearchContext for ${siteDefinition.siteId}`);
        }
    }

    function bootstrap(siteDefinition) {
        validateSiteDefinition(siteDefinition);

        const bootKey = `${siteDefinition.siteId}:${siteDefinition.namespace}`;
        if (bootstrappedSites.has(bootKey)) {
            return;
        }

        bootstrappedSites.add(bootKey);
        createSiteApp(siteDefinition);
    }

    function createSiteApp(siteDefinition) {
        const NAMESPACE = siteDefinition.namespace;
        const filterConfig = siteDefinition.filterConfig || {};
        const keywordConfig = siteDefinition.keyword;
        const namedCollections = Array.isArray(siteDefinition.namedCollections) ? siteDefinition.namedCollections : [];
        const keywordCollection = {
            id: 'keywords',
            exportKey: 'keywords',
            ...keywordConfig.collection
        };
        const collections = [keywordCollection, ...namedCollections];
        const collectionsById = new Map(collections.map(collection => [collection.id, collection]));
        const editorModalIds = [
            `${NAMESPACE}-keyword-edit-modal`,
            ...namedCollections.map(collection => `${NAMESPACE}-${collection.modalId}-edit-modal`)
        ];
        const defaultSettings = deepClone(siteDefinition.settings.defaultValue);

        let storageMigrationPromise = null;
        let shadowRoot = null;
        let contentContainer = null;
        let modalBackdrop = null;
        let settingsModal = null;
        let keywordDiv = null;
        let settingsButton = null;
        let syncButton = null;
        let addEntryButton = null;
        let importButton = null;
        let exportButton = null;
        let currentSearchContext = null;

        function getDefaultGroupColor(groupId) {
            return filterConfig?.[groupId]?.defaultColor || '#808080';
        }

        function getDefaultOptionColor(groupId, optionId) {
            return getFilterOption(filterConfig, groupId, optionId)?.color || '#808080';
        }

        async function ensureStorageMigration() {
            if (!storageMigrationPromise) {
                storageMigrationPromise = Promise.resolve(siteDefinition.storage?.migrate?.(runtimeContext) || null);
            }

            await storageMigrationPromise;
        }

        async function getSettings() {
            await ensureStorageMigration();

            const stored = await GM.getValue(siteDefinition.settings.storageKey, null);
            if (stored !== null && stored !== undefined && stored !== '') {
                return siteDefinition.settings.normalize(stored);
            }

            return deepClone(defaultSettings);
        }

        async function saveSettings(settings) {
            const normalizedSettings = siteDefinition.settings.normalize(settings);
            await GM.setValue(siteDefinition.settings.storageKey, JSON.stringify(normalizedSettings));
            return normalizedSettings;
        }

        async function getItems(collectionId) {
            await ensureStorageMigration();

            const collection = collectionsById.get(collectionId);
            if (!collection) {
                return [];
            }

            const stored = await GM.getValue(collection.storageKey, null);
            if (stored !== null && stored !== undefined) {
                return collection.read(stored);
            }

            if (typeof collection.getDefaultItems === 'function') {
                return collection.getDefaultItems();
            }

            return [];
        }

        async function saveItems(collectionId, items) {
            const collection = collectionsById.get(collectionId);
            if (!collection) {
                return;
            }

            await GM.setValue(collection.storageKey, collection.write(items));
        }

        async function getGroupColor(groupId) {
            const settings = await getSettings();
            return siteDefinition.settings.getGroupColor?.(settings, groupId) || getDefaultGroupColor(groupId);
        }

        async function getOptionColor(groupId, optionId) {
            const settings = await getSettings();
            return siteDefinition.settings.getOptionColor?.(settings, groupId, optionId) || getDefaultOptionColor(groupId, optionId);
        }

        function showNotification(message) {
            if (!contentContainer) {
                return;
            }

            const notification = document.createElement('div');
            notification.textContent = message;
            notification.className = `${NAMESPACE}-notification`;
            contentContainer.appendChild(notification);

            setTimeout(() => {
                notification.classList.add(`${NAMESPACE}-notification-show`);
                setTimeout(() => {
                    notification.classList.remove(`${NAMESPACE}-notification-show`);
                    setTimeout(() => {
                        if (contentContainer.contains(notification)) {
                            contentContainer.removeChild(notification);
                        }
                    }, 260);
                }, 2000);
            }, 16);
        }

        function createShadowContainer() {
            const container = document.createElement('div');
            container.id = `${NAMESPACE}-container`;
            container.style.cssText = 'all: initial; position: absolute; top: 0; left: 0; z-index: 999999;';
            document.body.appendChild(container);

            const root = container.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.textContent = getBaseStyles(NAMESPACE, siteDefinition.styles || '');
            root.appendChild(style);

            const shell = document.createElement('div');
            shell.className = `${NAMESPACE}-content-container`;
            root.appendChild(shell);

            return { shadowRoot: root, contentContainer: shell };
        }

        function isModalVisible(modalId) {
            const modal = shadowRoot?.getElementById(modalId);
            return Boolean(modal && modal.style.display === 'block');
        }

        function isEntryEditorModalVisible() {
            return editorModalIds.some(isModalVisible);
        }

        function isAnyPanelModalVisible() {
            return isModalVisible(`${NAMESPACE}-settings-modal`) || isEntryEditorModalVisible();
        }

        function showModalBackdrop() {
            if (!modalBackdrop) {
                return;
            }

            modalBackdrop.style.display = 'block';
            requestAnimationFrame(() => {
                modalBackdrop.style.opacity = '1';
            });

            [settingsButton, syncButton, addEntryButton].forEach(button => {
                if (button) {
                    button.style.pointerEvents = 'none';
                }
            });
        }

        function hideModalBackdrop() {
            if (!modalBackdrop || modalBackdrop.style.display === 'none') {
                return;
            }

            modalBackdrop.style.opacity = '0';
            modalBackdrop.addEventListener('transitionend', () => {
                modalBackdrop.style.display = 'none';
            }, { once: true });

            [settingsButton, syncButton, addEntryButton].forEach(button => {
                if (button) {
                    button.style.pointerEvents = 'auto';
                }
            });
        }

        function closeAllModals() {
            hideImportExportButtons();

            const allModalIds = [`${NAMESPACE}-settings-modal`, ...editorModalIds];
            allModalIds.forEach(modalId => {
                const modal = shadowRoot?.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                }
            });

            hideModalBackdrop();
        }

        function createModalBackdrop() {
            const backdrop = document.createElement('div');
            backdrop.id = `${NAMESPACE}-modal-backdrop`;
            backdrop.className = `${NAMESPACE}-modal-backdrop`;
            backdrop.style.display = 'none';

            backdrop.addEventListener('click', event => {
                if (isEntryEditorModalVisible()) {
                    event.stopPropagation();
                    return;
                }

                if (isModalVisible(`${NAMESPACE}-settings-modal`)) {
                    hideImportExportButtons();
                    event.stopPropagation();
                    return;
                }

                closeAllModals();
            });

            return backdrop;
        }

        function repositionDefaultPanel(anchorElement) {
            if (!anchorElement) {
                return;
            }

            const anchorRect = anchorElement.getBoundingClientRect();
            const maxWidth = Math.min(anchorRect.width, window.innerWidth * 0.9);
            const leftOffset = Math.max(
                window.scrollX + Math.min(anchorRect.left, window.innerWidth - maxWidth - 20),
                window.scrollX + (window.innerWidth - maxWidth) / 2
            );

            const container = document.getElementById(`${NAMESPACE}-container`);
            if (!container) {
                return;
            }

            container.style.position = 'absolute';
            container.style.top = `${anchorRect.bottom + window.scrollY + 10}px`;
            container.style.left = `${leftOffset}px`;
            container.style.width = `${maxWidth}px`;
        }

        function positionFixedPanel(top = 96, maxWidth = 520) {
            const container = document.getElementById(`${NAMESPACE}-container`);
            if (!container) {
                return;
            }

            container.style.position = 'fixed';
            container.style.top = `${top}px`;
            container.style.left = '50%';
            container.style.transform = 'translateX(-50%)';
            container.style.width = `${Math.min(window.innerWidth * 0.9, maxWidth)}px`;
        }

        function clearFixedPanelTransform() {
            const container = document.getElementById(`${NAMESPACE}-container`);
            if (container) {
                container.style.transform = '';
            }
        }

        function layoutFloatingControls() {
            const isMobile = window.innerWidth <= 768;
            const topOffsets = isMobile
                ? { settings: 0, sync: 45, add: 85, importButton: 125, exportButton: 165 }
                : { settings: 0, sync: 50, add: 95, importButton: 140, exportButton: 185 };

            [
                [settingsButton, topOffsets.settings],
                [syncButton, topOffsets.sync],
                [addEntryButton, topOffsets.add],
                [importButton, topOffsets.importButton],
                [exportButton, topOffsets.exportButton]
            ].forEach(([button, top]) => {
                if (button) {
                    button.style.position = 'absolute';
                    button.style.right = '-40px';
                    button.style.top = `${top}px`;
                }
            });
        }

        function resetImportExportButtons() {
            [importButton, exportButton].forEach(button => {
                if (button) {
                    button.style.display = 'none';
                    button.style.opacity = '0';
                    button.style.transform = 'translateY(-10px)';
                }
            });
        }

        function showFloatingControls() {
            layoutFloatingControls();

            [settingsButton, syncButton, addEntryButton].forEach(button => {
                if (button) {
                    button.style.display = 'block';
                }
            });

            resetImportExportButtons();
        }

        function hideFloatingControls() {
            [settingsButton, syncButton, addEntryButton].forEach(button => {
                if (button) {
                    button.style.display = 'none';
                }
            });

            hideImportExportButtons();
        }

        function isDescendantOrSelf(parent, child) {
            if (!parent || !child) {
                return false;
            }

            if (parent === child) {
                return true;
            }

            let currentNode = child.parentNode;
            while (currentNode) {
                if (currentNode === parent) {
                    return true;
                }
                currentNode = currentNode.parentNode;
            }

            return false;
        }

        function positionPanel(searchContext) {
            if (!searchContext) {
                return;
            }

            const anchor = searchContext.panelAnchor || searchContext.searchContainer;

            if (typeof searchContext.positionPanel === 'function') {
                searchContext.positionPanel({
                    keywordDiv,
                    settingsButton,
                    syncButton,
                    addEntryButton,
                    importButton,
                    exportButton,
                    repositionDefaultPanel,
                    positionFixedPanel,
                    clearFixedPanelTransform
                });
            } else if (anchor) {
                clearFixedPanelTransform();
                repositionDefaultPanel(anchor);
            }

            keywordDiv.style.position = 'relative';
            keywordDiv.style.top = '0';
            keywordDiv.style.left = '0';
            keywordDiv.style.width = '100%';
        }

        function showImportExportButtons() {
            if (!importButton || !exportButton) {
                return;
            }

            importButton.style.display = 'block';
            exportButton.style.display = 'block';

            requestAnimationFrame(() => {
                importButton.style.opacity = '1';
                importButton.style.transform = 'translateY(0)';

                setTimeout(() => {
                    exportButton.style.opacity = '1';
                    exportButton.style.transform = 'translateY(0)';
                }, 50);
            });
        }

        function hideImportExportButtons() {
            if (!importButton || !exportButton) {
                return;
            }

            exportButton.style.opacity = '0';
            exportButton.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                importButton.style.opacity = '0';
                importButton.style.transform = 'translateY(-10px)';

                setTimeout(() => {
                    importButton.style.display = 'none';
                    exportButton.style.display = 'none';
                }, 240);
            }, 50);
        }

        function toggleImportExportButtons() {
            if (!importButton || !exportButton) {
                return;
            }

            if (importButton.style.display === 'block') {
                hideImportExportButtons();
            } else {
                showImportExportButtons();
            }
        }

        function createSyncButton() {
            const button = document.createElement('button');
            button.id = `${NAMESPACE}-sync-button`;
            button.className = `${NAMESPACE}-icon-btn ${NAMESPACE}-sync-external-btn`;
            button.title = siteDefinition.ui?.syncTitle || 'Sync';
            button.textContent = '🔄';

            button.addEventListener('click', event => {
                event.stopPropagation();
                toggleImportExportButtons();

                const modal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
                if (modal && modal.style.display === 'block') {
                    modal.style.display = 'none';
                    hideModalBackdrop();
                }
            });

            return button;
        }

        function createAddEntryButton() {
            const button = document.createElement('button');
            button.id = `${NAMESPACE}-add-entry-button`;
            button.className = `${NAMESPACE}-icon-btn ${NAMESPACE}-add-external-btn`;
            button.title = keywordConfig.addButtonLabel;
            button.setAttribute('aria-label', keywordConfig.addButtonLabel);
            button.textContent = '+';

            button.addEventListener('click', async event => {
                event.stopPropagation();
                hideImportExportButtons();

                const panel = shadowRoot.getElementById(`${NAMESPACE}-keyword-search-container`);
                if (panel && typeof panel.openAddEntryModal === 'function') {
                    await panel.openAddEntryModal();
                }
            });

            return button;
        }

        function createSettingsButton() {
            const button = document.createElement('button');
            button.id = `${NAMESPACE}-settings-button`;
            button.className = `${NAMESPACE}-icon-btn ${NAMESPACE}-settings-external-btn`;
            button.title = siteDefinition.ui?.settingsTitle || 'Settings';
            button.textContent = '🛠️';

            button.addEventListener('click', async event => {
                event.stopPropagation();
                hideImportExportButtons();

                const modal = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
                if (!modal) {
                    return;
                }

                if (typeof modal.syncFromSettings === 'function') {
                    await modal.syncFromSettings();
                }

                modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
                if (modal.style.display === 'block') {
                    showModalBackdrop();
                } else {
                    hideModalBackdrop();
                }
            });

            return button;
        }

        function createImportButton() {
            const button = document.createElement('button');
            button.id = `${NAMESPACE}-import-button`;
            button.className = `${NAMESPACE}-icon-btn ${NAMESPACE}-import-export-btn`;
            button.title = siteDefinition.ui?.importTitle || 'Import Data';
            button.textContent = '📥';
            button.style.display = 'none';

            button.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.json,application/json';
                fileInput.style.display = 'none';

                fileInput.addEventListener('click', clickEvent => {
                    clickEvent.stopPropagation();
                });

                fileInput.addEventListener('change', async changeEvent => {
                    changeEvent.stopPropagation();
                    const [file] = changeEvent.target.files || [];
                    if (!file) {
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = async loadEvent => {
                        try {
                            const importedData = JSON.parse(loadEvent.target.result);
                            const normalizedData = await siteDefinition.importExport.normalizeImportedData(importedData, runtimeContext);

                            if (!normalizedData || typeof normalizedData !== 'object') {
                                alert(siteDefinition.ui?.invalidImportText || 'Invalid import file format!');
                                return;
                            }

                            for (const collection of collections) {
                                if (normalizedData[collection.id] !== undefined) {
                                    await saveItems(collection.id, normalizedData[collection.id]);
                                }
                            }

                            alert(siteDefinition.ui?.importSuccessText || 'Data imported successfully!');
                            if (keywordDiv && typeof keywordDiv.refreshKeywordList === 'function') {
                                await keywordDiv.refreshKeywordList();
                            }
                        } catch (error) {
                            console.error(`[${siteDefinition.siteId}] Import failed`, error);
                            alert(siteDefinition.ui?.importParseErrorText || 'Failed to parse import file!');
                        }
                    };

                    reader.readAsText(file);
                });

                document.body.appendChild(fileInput);
                setTimeout(() => {
                    fileInput.click();
                    setTimeout(() => {
                        if (document.body.contains(fileInput)) {
                            document.body.removeChild(fileInput);
                        }
                    }, 300);
                }, 0);
            });

            return button;
        }

        function createExportButton() {
            const button = document.createElement('button');
            button.id = `${NAMESPACE}-export-button`;
            button.className = `${NAMESPACE}-icon-btn ${NAMESPACE}-import-export-btn`;
            button.title = siteDefinition.ui?.exportTitle || 'Export Data';
            button.textContent = '📤';
            button.style.display = 'none';

            button.addEventListener('click', async event => {
                event.preventDefault();
                event.stopPropagation();

                const exportData = {};
                for (const collection of collections) {
                    exportData[collection.exportKey || collection.id] = await getItems(collection.id);
                }

                const dataUri = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 4))}`;
                const downloadAnchor = document.createElement('a');
                downloadAnchor.href = dataUri;
                downloadAnchor.download = siteDefinition.importExport.fileName;

                downloadAnchor.addEventListener('click', clickEvent => {
                    clickEvent.stopPropagation();
                });

                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                document.body.removeChild(downloadAnchor);
            });

            return button;
        }

        function createEditModal(modalId, titleText, extraClassName = '') {
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = `${NAMESPACE}-sync-modal ${NAMESPACE}-centered-modal ${NAMESPACE}-edit-modal`;
            if (extraClassName) {
                modal.classList.add(extraClassName);
            }
            modal.style.display = 'none';

            const modalContent = document.createElement('div');
            modalContent.className = `${NAMESPACE}-sync-modal-content`;

            const header = document.createElement('div');
            header.className = `${NAMESPACE}-sync-modal-header`;

            const titleElement = document.createElement('h2');
            titleElement.textContent = titleText;
            header.appendChild(titleElement);

            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = `${NAMESPACE}-sync-modal-close-btn`;
            closeButton.textContent = '×';
            closeButton.addEventListener('click', () => {
                closeAllModals();
            });
            header.appendChild(closeButton);

            const body = document.createElement('div');
            body.className = `${NAMESPACE}-settings-modal-body ${NAMESPACE}-edit-modal-body`;

            modalContent.appendChild(header);
            modalContent.appendChild(body);
            modal.appendChild(modalContent);
            modal.addEventListener('click', event => event.stopPropagation());

            return { modal, body, titleElement };
        }

        function createEditField(labelText, inputElement) {
            const field = document.createElement('div');
            field.className = `${NAMESPACE}-edit-field`;

            const label = document.createElement('label');
            label.className = `${NAMESPACE}-edit-field-label`;
            label.textContent = labelText;

            field.appendChild(label);
            field.appendChild(inputElement);
            return field;
        }

        function createListEditButton(title, onClick) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `${NAMESPACE}-tag-action-btn ${NAMESPACE}-edit-tag`;
            button.title = title;
            button.setAttribute('aria-label', title);

            const icon = document.createElement('span');
            icon.className = `${NAMESPACE}-edit-tag-icon`;
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = '✎';
            button.appendChild(icon);

            button.addEventListener('click', onClick);
            return button;
        }

        function createFilterBadge(groupId, optionId, label) {
            const badge = document.createElement('span');
            badge.className = `${NAMESPACE}-filter-badge`;
            badge.dataset.group = groupId;
            badge.dataset.value = optionId;
            badge.textContent = label;
            return badge;
        }

        function openPanelModal(modal) {
            hideImportExportButtons();

            const settings = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            if (settings) {
                settings.style.display = 'none';
            }

            editorModalIds.forEach(modalId => {
                const currentModal = shadowRoot.getElementById(modalId);
                if (currentModal && currentModal !== modal) {
                    currentModal.style.display = 'none';
                }
            });

            modal.style.display = 'block';
            showModalBackdrop();
        }

        function closePanel() {
            if (!keywordDiv) {
                return;
            }

            keywordDiv.style.opacity = '0';
            keywordDiv.style.transform = 'scale(0.95)';
            keywordDiv.style.display = 'none';
            hideFloatingControls();
            closeAllModals();
        }

        async function openConfigModal() {
            if (!keywordDiv || keywordDiv.style.display === 'block') {
                return;
            }

            const searchContext = siteDefinition.dom.getSearchContext(runtimeContext);
            if (!searchContext) {
                return;
            }

            currentSearchContext = searchContext;
            showFloatingControls();
            positionPanel(searchContext);
            keywordDiv.style.display = 'block';

            requestAnimationFrame(() => {
                keywordDiv.style.opacity = '1';
                keywordDiv.style.transform = 'scale(1)';
                if (typeof keywordDiv.focusActiveInput === 'function') {
                    setTimeout(() => keywordDiv.focusActiveInput(), 100);
                }
            });
        }

        function createKeywordDiv() {
            const panel = document.createElement('div');
            panel.id = `${NAMESPACE}-keyword-search-container`;
            panel.className = `${NAMESPACE}-keyword-search-container`;
            panel.style.display = 'none';

            const activeIndices = Object.fromEntries(collections.map(collection => [collection.id, -1]));
            const tabButtons = new Map();
            const tabContents = new Map();
            const sectionElements = new Map();
            const listElements = new Map();
            const editorStates = new Map();
            let activePanelTab = 'keywords';

            const panelTabs = [
                {
                    id: 'keywords',
                    title: keywordConfig.title,
                    tabLabel: keywordConfig.tabLabel
                },
                ...namedCollections.map(collection => ({
                    id: collection.id,
                    title: collection.title,
                    tabLabel: collection.tabLabel
                }))
            ];

            const tabContainer = document.createElement('div');
            tabContainer.className = `${NAMESPACE}-panel-tab-container`;
            tabContainer.setAttribute('role', 'tablist');
            tabContainer.style.gridTemplateColumns = `repeat(${panelTabs.length}, minmax(0, 1fr))`;
            panel.appendChild(tabContainer);

            const tabContentContainer = document.createElement('div');
            tabContentContainer.className = `${NAMESPACE}-panel-tab-content-container`;
            panel.appendChild(tabContentContainer);

            panelTabs.forEach((tabData, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `${NAMESPACE}-panel-tab-button${index === 0 ? ` ${NAMESPACE}-active-tab` : ''}`;
                button.textContent = tabData.tabLabel;
                button.setAttribute('role', 'tab');
                button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

                const content = document.createElement('div');
                content.id = `${NAMESPACE}-${tabData.id}-tab-content`;
                content.className = `${NAMESPACE}-panel-tab-content`;
                content.setAttribute('role', 'tabpanel');
                content.style.display = index === 0 ? 'flex' : 'none';

                const section = document.createElement('div');
                section.className = `${NAMESPACE}-saved-group`;

                const title = document.createElement('h3');
                title.className = `${NAMESPACE}-panel-title`;
                title.textContent = tabData.title;
                section.appendChild(title);

                const list = document.createElement('ul');
                list.className = `${NAMESPACE}-tag-list`;
                section.appendChild(list);

                content.appendChild(section);

                button.setAttribute('aria-controls', content.id);
                button.addEventListener('click', () => activatePanelTab(tabData.id));

                tabContainer.appendChild(button);
                tabContentContainer.appendChild(content);

                tabButtons.set(tabData.id, button);
                tabContents.set(tabData.id, content);
                sectionElements.set(tabData.id, section);
                listElements.set(tabData.id, list);
            });

            function getAddActionLabel(collectionId) {
                return collectionId === 'keywords'
                    ? keywordConfig.addButtonLabel
                    : (collectionsById.get(collectionId)?.addButtonLabel || keywordConfig.addButtonLabel);
            }

            function activatePanelTab(tabId) {
                activePanelTab = tabId;

                panelTabs.forEach(tabData => {
                    const isActive = tabData.id === tabId;
                    const button = tabButtons.get(tabData.id);
                    const content = tabContents.get(tabData.id);

                    if (button) {
                        button.classList.toggle(`${NAMESPACE}-active-tab`, isActive);
                        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    }

                    if (content) {
                        content.style.display = isActive ? 'flex' : 'none';
                    }
                });

                if (addEntryButton) {
                    const label = getAddActionLabel(tabId);
                    addEntryButton.title = label;
                    addEntryButton.setAttribute('aria-label', label);
                }
            }

            async function renderKeywordList() {
                const list = listElements.get('keywords');
                const section = sectionElements.get('keywords');
                if (!list || !section) {
                    return;
                }

                list.replaceChildren();

                const items = await getItems('keywords');
                section.hidden = items.length === 0;

                for (let index = 0; index < items.length; index += 1) {
                    const item = items[index];
                    const listItem = document.createElement('li');
                    listItem.className = `${NAMESPACE}-tag-item`;

                    const searchButton = document.createElement('button');
                    searchButton.type = 'button';
                    searchButton.className = `${NAMESPACE}-tag-main-action`;

                    const meta = keywordConfig.getSearchButtonMeta(item);
                    searchButton.title = meta.title;
                    searchButton.setAttribute('aria-label', meta.ariaLabel);

                    const text = document.createElement('span');
                    text.className = `${NAMESPACE}-tag-main-label`;
                    text.textContent = `${keywordConfig.icon} ${item.keyword}`;
                    searchButton.appendChild(text);

                    await keywordConfig.renderBadges({
                        item,
                        searchButton,
                        filterConfig,
                        createFilterBadge,
                        getOptionColor
                    });

                    searchButton.addEventListener('click', () => {
                        window.location.href = keywordConfig.buildTargetUrl(item);
                        closePanel();
                    });

                    const editButton = createListEditButton(keywordConfig.editButtonTitle, async () => {
                        const keywords = await getItems('keywords');
                        const currentItem = keywords[index];
                        if (!currentItem) {
                            await panel.refreshKeywordList();
                            return;
                        }
                        editorStates.get('keywords').open(currentItem, index);
                    });

                    const actionContainer = document.createElement('div');
                    actionContainer.className = `${NAMESPACE}-tag-actions`;
                    actionContainer.appendChild(editButton);

                    listItem.appendChild(searchButton);
                    listItem.appendChild(actionContainer);
                    list.appendChild(listItem);
                }
            }

            async function renderNamedCollection(collection) {
                const list = listElements.get(collection.id);
                const section = sectionElements.get(collection.id);
                if (!list || !section) {
                    return;
                }

                list.replaceChildren();

                const items = await getItems(collection.id);
                section.hidden = items.length === 0;

                for (let index = 0; index < items.length; index += 1) {
                    const item = items[index];
                    const targetUrl = collection.buildTargetUrl(item);
                    const displayLabel = collection.getDisplayLabel(item);

                    const listItem = document.createElement('li');
                    listItem.className = `${NAMESPACE}-tag-item`;

                    const openButton = document.createElement('button');
                    openButton.type = 'button';
                    openButton.className = `${NAMESPACE}-tag-main-action`;
                    openButton.title = targetUrl ? collection.openTitle : collection.invalidTitle;
                    openButton.setAttribute(
                        'aria-label',
                        targetUrl
                            ? `${collection.openTitle} ${displayLabel}`
                            : `${displayLabel} ${collection.invalidTitle}`
                    );

                    const label = document.createElement('span');
                    label.className = `${NAMESPACE}-tag-main-label`;
                    label.textContent = `${collection.icon} ${displayLabel}`;
                    openButton.appendChild(label);

                    if (!targetUrl) {
                        openButton.disabled = true;
                    } else {
                        openButton.addEventListener('click', () => {
                            window.location.href = targetUrl;
                            closePanel();
                        });
                    }

                    const editButton = createListEditButton(collection.editButtonTitle, async () => {
                        const currentItems = await getItems(collection.id);
                        const currentItem = currentItems[index];
                        if (!currentItem) {
                            await panel.refreshKeywordList();
                            return;
                        }
                        editorStates.get(collection.id).open(currentItem, index);
                    });

                    const actionContainer = document.createElement('div');
                    actionContainer.className = `${NAMESPACE}-tag-actions`;
                    actionContainer.appendChild(editButton);

                    listItem.appendChild(openButton);
                    listItem.appendChild(actionContainer);
                    list.appendChild(listItem);
                }
            }

            function createKeywordEditModal() {
                const { modal, body, titleElement } = createEditModal(`${NAMESPACE}-keyword-edit-modal`, keywordConfig.editModalTitle, `${NAMESPACE}-keyword-edit-modal`);
                let mode = 'edit';

                const keywordInput = document.createElement('input');
                keywordInput.type = 'text';
                keywordInput.placeholder = keywordConfig.fieldPlaceholder;
                keywordInput.className = `${NAMESPACE}-modern-input ${NAMESPACE}-edit-input`;
                keywordInput.maxLength = 100;
                body.appendChild(createEditField(keywordConfig.fieldLabel, keywordInput));

                const filterEditor = keywordConfig.createFilterEditor(runtimeContext, 'keyword-edit');
                body.appendChild(filterEditor.container);

                const footer = document.createElement('div');
                footer.className = `${NAMESPACE}-settings-footer ${NAMESPACE}-edit-modal-footer`;

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = `${NAMESPACE}-settings-btn ${NAMESPACE}-edit-delete-btn`;
                deleteButton.textContent = keywordConfig.deleteButtonText;
                deleteButton.addEventListener('click', async () => {
                    if (mode !== 'edit' || activeIndices.keywords < 0) {
                        return;
                    }

                    const keywords = await getItems('keywords');
                    if (!keywords[activeIndices.keywords]) {
                        closeAllModals();
                        await panel.refreshKeywordList();
                        return;
                    }

                    const nextKeywords = keywords.filter((_, index) => index !== activeIndices.keywords);
                    activeIndices.keywords = -1;
                    await saveItems('keywords', nextKeywords);
                    await panel.refreshKeywordList();
                    closeAllModals();
                });

                const saveButton = document.createElement('button');
                saveButton.type = 'button';
                saveButton.className = `${NAMESPACE}-settings-btn ${NAMESPACE}-save-btn`;
                saveButton.textContent = keywordConfig.saveButtonText;

                async function submitKeyword() {
                    const keywordValue = keywordInput.value.trim();
                    if (!keywordValue) {
                        alert(keywordConfig.emptyAlert);
                        keywordInput.focus();
                        return;
                    }

                    const nextFilters = filterEditor.readFilters();
                    const nextEntry = keywordConfig.createEntry(keywordValue, { filters: nextFilters });
                    const nextKey = keywordConfig.getDuplicateKey(nextEntry);
                    const keywords = await getItems('keywords');

                    if (mode === 'edit' && !keywords[activeIndices.keywords]) {
                        closeAllModals();
                        await panel.refreshKeywordList();
                        return;
                    }

                    const hasDuplicate = keywords.some((item, index) => {
                        if (index === activeIndices.keywords) {
                            return false;
                        }

                        return keywordConfig.getDuplicateKey(item) === nextKey;
                    });

                    if (hasDuplicate) {
                        alert(keywordConfig.duplicateAlert);
                        keywordInput.focus();
                        return;
                    }

                    const nextKeywords = [...keywords];
                    if (mode === 'edit') {
                        nextKeywords[activeIndices.keywords] = nextEntry;
                    } else {
                        nextKeywords.push(nextEntry);
                    }

                    activeIndices.keywords = -1;
                    await saveItems('keywords', nextKeywords);
                    await panel.refreshKeywordList();
                    closeAllModals();
                }

                saveButton.addEventListener('click', submitKeyword);
                keywordInput.addEventListener('keydown', async event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        await submitKeyword();
                    }
                });

                footer.appendChild(deleteButton);
                footer.appendChild(saveButton);
                body.appendChild(footer);

                function open(modeName, item, index, filters) {
                    mode = modeName;
                    activeIndices.keywords = mode === 'edit' ? index : -1;
                    titleElement.textContent = mode === 'edit' ? keywordConfig.editModalTitle : keywordConfig.createModalTitle;
                    saveButton.textContent = mode === 'edit' ? keywordConfig.saveButtonText : keywordConfig.createButtonText;
                    deleteButton.style.display = mode === 'edit' ? 'inline-flex' : 'none';
                    keywordInput.value = item?.keyword || '';
                    filterEditor.writeFilters(filters || item?.filters || keywordConfig.createDefaultFilters());
                    openPanelModal(modal);
                    setTimeout(() => keywordInput.focus(), 80);
                }

                return {
                    modal,
                    open(item, index) {
                        open('edit', item, index, item?.filters || keywordConfig.createDefaultFilters());
                    },
                    async openForCreate() {
                        const settings = await getSettings();
                        open('create', null, -1, keywordConfig.createDefaultFilters(settings?.defaultFilters || {}));
                    }
                };
            }

            function createNamedEditModal(collection) {
                const { modal, body, titleElement } = createEditModal(`${NAMESPACE}-${collection.modalId}-edit-modal`, collection.editModalTitle);
                let mode = 'edit';

                const labelInput = document.createElement('input');
                labelInput.type = 'text';
                labelInput.placeholder = collection.labelFieldPlaceholder;
                labelInput.className = `${NAMESPACE}-modern-input ${NAMESPACE}-edit-input`;
                labelInput.maxLength = 100;
                body.appendChild(createEditField(collection.labelFieldLabel, labelInput));

                const valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.placeholder = collection.valueFieldPlaceholder;
                valueInput.className = `${NAMESPACE}-modern-input ${NAMESPACE}-edit-input`;
                valueInput.autocomplete = 'off';
                valueInput.spellcheck = false;
                body.appendChild(createEditField(collection.valueFieldLabel, valueInput));

                const footer = document.createElement('div');
                footer.className = `${NAMESPACE}-settings-footer ${NAMESPACE}-edit-modal-footer`;

                const deleteButton = document.createElement('button');
                deleteButton.type = 'button';
                deleteButton.className = `${NAMESPACE}-settings-btn ${NAMESPACE}-edit-delete-btn`;
                deleteButton.textContent = collection.deleteButtonText;
                deleteButton.addEventListener('click', async () => {
                    if (mode !== 'edit' || activeIndices[collection.id] < 0) {
                        return;
                    }

                    const items = await getItems(collection.id);
                    if (!items[activeIndices[collection.id]]) {
                        closeAllModals();
                        await panel.refreshKeywordList();
                        return;
                    }

                    const nextItems = items.filter((_, index) => index !== activeIndices[collection.id]);
                    activeIndices[collection.id] = -1;
                    await saveItems(collection.id, nextItems);
                    await panel.refreshKeywordList();
                    closeAllModals();
                });

                const saveButton = document.createElement('button');
                saveButton.type = 'button';
                saveButton.className = `${NAMESPACE}-settings-btn ${NAMESPACE}-save-btn`;
                saveButton.textContent = collection.saveButtonText;

                async function submitItem() {
                    const rawValue = valueInput.value.trim();
                    if (!rawValue) {
                        alert(collection.emptyAlert);
                        valueInput.focus();
                        return;
                    }

                    const normalizedTarget = collection.normalizeTargetValue(rawValue);
                    if (!normalizedTarget) {
                        alert(collection.invalidAlert);
                        valueInput.focus();
                        return;
                    }

                    const items = await getItems(collection.id);
                    if (mode === 'edit' && !items[activeIndices[collection.id]]) {
                        closeAllModals();
                        await panel.refreshKeywordList();
                        return;
                    }

                    const hasDuplicate = items.some((item, index) => {
                        if (index === activeIndices[collection.id]) {
                            return false;
                        }

                        return collection.buildTargetUrl(item) === normalizedTarget;
                    });

                    if (hasDuplicate) {
                        alert(collection.duplicateAlert);
                        valueInput.focus();
                        return;
                    }

                    const nextItems = [...items];
                    const nextLabel = mode === 'edit'
                        ? labelInput.value.trim()
                        : (labelInput.value.trim() || collection.getSuggestedLabel(normalizedTarget, rawValue));
                    const nextEntry = collection.createEntry(nextLabel, rawValue);

                    if (mode === 'edit') {
                        nextItems[activeIndices[collection.id]] = nextEntry;
                    } else {
                        nextItems.push(nextEntry);
                    }

                    activeIndices[collection.id] = -1;
                    await saveItems(collection.id, nextItems);
                    await panel.refreshKeywordList();
                    closeAllModals();
                }

                saveButton.addEventListener('click', submitItem);

                [labelInput, valueInput].forEach(input => {
                    input.addEventListener('keydown', async event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            await submitItem();
                        }
                    });
                });

                footer.appendChild(deleteButton);
                footer.appendChild(saveButton);
                body.appendChild(footer);

                function open(modeName, item, index) {
                    mode = modeName;
                    activeIndices[collection.id] = mode === 'edit' ? index : -1;
                    titleElement.textContent = mode === 'edit' ? collection.editModalTitle : collection.createModalTitle;
                    saveButton.textContent = mode === 'edit' ? collection.saveButtonText : collection.createButtonText;
                    deleteButton.style.display = mode === 'edit' ? 'inline-flex' : 'none';
                    labelInput.value = item?.label || '';
                    const createValue = typeof collection.getCreateInitialValue === 'function'
                        ? collection.getCreateInitialValue()
                        : window.location.href;
                    valueInput.value = mode === 'edit'
                        ? (item?.url || '')
                        : (createValue || '');
                    openPanelModal(modal);
                    setTimeout(() => valueInput.focus(), 80);
                }

                return {
                    modal,
                    open(item, index) {
                        open('edit', item, index);
                    },
                    async openForCreate() {
                        open('create', null, -1);
                    }
                };
            }

            editorStates.set('keywords', createKeywordEditModal());
            contentContainer.appendChild(editorStates.get('keywords').modal);

            namedCollections.forEach(collection => {
                const state = createNamedEditModal(collection);
                editorStates.set(collection.id, state);
                contentContainer.appendChild(state.modal);
            });

            panel.refreshKeywordList = async () => {
                await renderKeywordList();
                for (const collection of namedCollections) {
                    await renderNamedCollection(collection);
                }
            };

            panel.focusActiveInput = () => {
                if (addEntryButton && addEntryButton.style.display !== 'none') {
                    addEntryButton.focus();
                    return;
                }

                const activeButton = tabButtons.get(activePanelTab) || tabButtons.get('keywords');
                if (activeButton) {
                    activeButton.focus();
                }
            };

            panel.openAddEntryModal = async () => {
                const editorState = editorStates.get(activePanelTab);
                if (editorState && typeof editorState.openForCreate === 'function') {
                    await editorState.openForCreate();
                }
            };

            activatePanelTab(activePanelTab);
            panel.refreshKeywordList();

            return panel;
        }

        function createKeywordButton() {
            const button = document.createElement('button');
            button.type = 'button';
            button.id = `${NAMESPACE}-keyword-tag-button`;
            button.className = `${NAMESPACE}-modern-btn`;
            button.textContent = siteDefinition.ui?.keywordButtonText || '🏷️';
            button.style.cssText = `
                background: none !important;
                border: none !important;
                cursor: pointer;
                color: var(--button-icon-color, #333);
                transition: color 0.2s ease;
                padding: 0;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                outline: none;
                box-shadow: none !important;
                position: absolute !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                height: auto !important;
                z-index: 2147483647 !important;
            `;
            return button;
        }

        function applyResponsiveSearchLayout(searchContext, keywordButton) {
            const isMobile = window.innerWidth <= 768;
            if (typeof searchContext.applyLayout === 'function') {
                searchContext.applyLayout({ isMobile, keywordButton });
            }

            if (keywordDiv && keywordDiv.style.display === 'block') {
                layoutFloatingControls();
                positionPanel(searchContext);
            }
        }

        function attachSiteUi(searchContext) {
            const keywordButton = createKeywordButton();
            currentSearchContext = searchContext;

            if (typeof searchContext.attachButton === 'function') {
                searchContext.attachButton(keywordButton);
            } else {
                (searchContext.panelAnchor || searchContext.searchContainer).appendChild(keywordButton);
            }

            applyResponsiveSearchLayout(searchContext, keywordButton);

            function toggleKeywordPanel(show) {
                const nextVisible = show !== undefined ? show : keywordDiv.style.display !== 'block';

                if (!nextVisible) {
                    keywordDiv.style.opacity = '0';
                    keywordDiv.style.transform = 'scale(0.95)';
                    keywordDiv.style.display = 'none';
                    hideFloatingControls();
                    return;
                }

                showFloatingControls();
                positionPanel(searchContext);
                keywordDiv.style.display = 'block';

                requestAnimationFrame(() => {
                    keywordDiv.style.opacity = '1';
                    keywordDiv.style.transform = 'scale(1)';
                    if (typeof keywordDiv.focusActiveInput === 'function') {
                        setTimeout(() => keywordDiv.focusActiveInput(), 100);
                    }
                });
            }

            keywordButton.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                toggleKeywordPanel();
            });

            document.addEventListener('click', event => {
                const target = event.target;
                const settings = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
                const controlElements = [
                    keywordDiv,
                    syncButton,
                    addEntryButton,
                    importButton,
                    exportButton,
                    settingsButton,
                    settings,
                    ...editorModalIds.map(modalId => shadowRoot.getElementById(modalId)),
                    keywordButton
                ].filter(Boolean);

                const isControlElement = controlElements.some(element => isDescendantOrSelf(element, target));
                if (!isControlElement) {
                    if (isAnyPanelModalVisible()) {
                        hideImportExportButtons();
                        return;
                    }

                    toggleKeywordPanel(false);
                    closeAllModals();
                }
            });

            [keywordDiv, syncButton, addEntryButton, importButton, exportButton, settingsButton].forEach(element => {
                if (element) {
                    element.addEventListener('click', event => event.stopPropagation());
                }
            });

            const settings = shadowRoot.getElementById(`${NAMESPACE}-settings-modal`);
            if (settings) {
                settings.addEventListener('click', event => event.stopPropagation());
            }

            editorModalIds.forEach(modalId => {
                const modal = shadowRoot.getElementById(modalId);
                if (modal) {
                    modal.addEventListener('click', event => event.stopPropagation());
                }
            });

            const handleResize = () => {
                applyResponsiveSearchLayout(searchContext, keywordButton);
            };

            const handleScroll = () => {
                if (keywordDiv.style.display === 'block') {
                    positionPanel(searchContext);
                }
            };

            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleScroll);
        }

        function initScript() {
            if (typeof siteDefinition.dom.pageMatches === 'function' && !siteDefinition.dom.pageMatches(window.location.href)) {
                return;
            }

            const searchContext = siteDefinition.dom.getSearchContext(runtimeContext);
            if (!searchContext) {
                return;
            }

            if (document.querySelector(`#${NAMESPACE}-keyword-tag-button`)) {
                return;
            }

            attachSiteUi(searchContext);
        }

        const runtimeContext = {
            version: TEMPLATE_VERSION,
            siteDefinition,
            NAMESPACE,
            filterConfig,
            defaultSettings,
            parseStoredJson,
            deepClone,
            createNamedUrlEntry,
            getSettings,
            saveSettings,
            getItems,
            saveItems,
            getGroupColor,
            getOptionColor,
            showNotification,
            showModalBackdrop,
            hideModalBackdrop,
            closeAllModals,
            closePanel,
            openPanelModal,
            positionFixedPanel,
            clearFixedPanelTransform,
            repositionDefaultPanel,
            refreshPanelLists: async () => {
                if (keywordDiv && typeof keywordDiv.refreshKeywordList === 'function') {
                    await keywordDiv.refreshKeywordList();
                }
            },
            get contentContainer() {
                return contentContainer;
            },
            get shadowRoot() {
                return shadowRoot;
            }
        };

        const shell = createShadowContainer();
        shadowRoot = shell.shadowRoot;
        contentContainer = shell.contentContainer;

        modalBackdrop = createModalBackdrop();
        contentContainer.appendChild(modalBackdrop);

        settingsButton = createSettingsButton();
        syncButton = createSyncButton();
        addEntryButton = createAddEntryButton();
        importButton = createImportButton();
        exportButton = createExportButton();
        keywordDiv = createKeywordDiv();
        settingsModal = siteDefinition.settings.createModal(runtimeContext);

        contentContainer.appendChild(settingsButton);
        contentContainer.appendChild(syncButton);
        contentContainer.appendChild(addEntryButton);
        contentContainer.appendChild(importButton);
        contentContainer.appendChild(exportButton);
        contentContainer.appendChild(keywordDiv);
        contentContainer.appendChild(settingsModal);

        initScript();

        if (document.body) {
            const observer = new MutationObserver(() => initScript());
            observer.observe(document.body, { childList: true, subtree: true });
        }

        window.addEventListener('load', () => initScript());
        if (typeof GM !== 'undefined' && typeof GM.registerMenuCommand === 'function') {
            GM.registerMenuCommand(siteDefinition.menuCommandLabel, openConfigModal);
        }
    }

    global.KSETemplateRuntime = Object.freeze({
        version: TEMPLATE_VERSION,
        bootstrap
    });
})(globalThis);
