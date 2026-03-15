// ==UserScript==
// @name         [YouTube] Keywords Search Enhanced [20260315] v1.0.0
// @namespace    0_V userscripts/[YouTube] Keywords Search Enhanced
// @description  Manage YouTube keywords, search with filters, jump to channels, and open saved links.
// @version      [20260315] v1.0.0
// @update-log   Extract shared template runtime and site wrapper
//
// @match        *://*.youtube.com/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @require      https://github.com/0-V-linuxdo/Template-Keywords-Search-Enhanced/raw/refs/heads/main/Template_JS/%5BTemplate%5D%20Keywords%20Search%20Enhanced.template.js
//
// @icon         https://github.com/0-V-linuxdo/-YouTube-Keywords-Search-Enhanced/raw/refs/heads/main/assets/main_icon.svg
// ==/UserScript==

/* ===================== WRAPPER · NOTICE · START =====================
 *
 * [编辑指引 | Edit Guidance]
 *   • 共享 runtime 请修改 `src/template/`。
 *   • 站点脚本请修改 `src/sites/<site>/`。
 *   • 运行 `npm run build` 后，只以 `dist/` 下的产物为准。
 *
 * ====================== WRAPPER · NOTICE · END ====================== */

const siteDefinition = (() => {
    const SITE_VERSION = '[20260315] v1.0.0';
    const NAMESPACE = 'yt-kse';

    function parseStoredSettings(rawSettings) {
        if (!rawSettings) {
            return null;
        }

        if (typeof rawSettings === 'string') {
            try {
                return JSON.parse(rawSettings);
            } catch {
                return null;
            }
        }

        return typeof rawSettings === 'object' ? rawSettings : null;
    }

    function createDefaultFilters(rawFilters = {}) {
        return {
            uploadDate: rawFilters.uploadDate || '',
            type: rawFilters.type || '',
            duration: rawFilters.duration || '',
            features: Array.isArray(rawFilters.features)
                ? rawFilters.features
                : (rawFilters.features ? [rawFilters.features] : []),
            sortBy: rawFilters.sortBy || 'relevance'
        };
    }

    function createKeywordEntry(keyword, options = {}) {
        const normalizedKeyword = typeof keyword === 'string' ? keyword : String(keyword ?? '');
        return {
            keyword: normalizedKeyword,
            filters: createDefaultFilters(options.filters)
        };
    }

    function createNamedUrlEntry(label, url) {
        return {
            label: typeof label === 'string' ? label.trim() : String(label ?? '').trim(),
            url: typeof url === 'string' ? url.trim() : String(url ?? '').trim()
        };
    }

    function createChannelEntry(label, url) {
        return createNamedUrlEntry(label, url);
    }

    function createLinkEntry(label, url) {
        return createNamedUrlEntry(label, url);
    }

    const defaultKeywords = [
        'Music',
        'Movie Trailers',
        'Tech Reviews',
        'Cooking Tutorials',
        'Funny Clips'
    ].map(keyword => createKeywordEntry(keyword));

    const filterConfig = {
        uploadDate: {
            name: 'Upload Date',
            options: [
                { id: 'lastHour', name: 'Last hour', sp: 'EgIIAQ%253D%253D', color: '#FF6F61' },
                { id: 'today', name: 'Today', sp: 'EgIIAg%253D%253D', color: '#FFB085' },
                { id: 'thisWeek', name: 'This week', sp: 'EgIIAw%253D%253D', color: '#FFD700' },
                { id: 'thisMonth', name: 'This month', sp: 'EgIIBA%253D%253D', color: '#9ACD32' },
                { id: 'thisYear', name: 'This year', sp: 'EgIIBQ%253D%253D', color: '#20B2AA' }
            ],
            defaultColor: '#FF4500'
        },
        type: {
            name: 'Type',
            options: [
                { id: 'video', name: 'Video', sp: 'EgIQAQ%253D%253D', color: '#FF1493' },
                { id: 'channel', name: 'Channel', sp: 'EgIQAg%253D%253D', color: '#9400D3' },
                { id: 'playlist', name: 'Playlist', sp: 'EgIQAw%253D%253D', color: '#4B0082' },
                { id: 'movie', name: 'Movie', sp: 'EgIQBA%253D%253D', color: '#00CED1' }
            ],
            defaultColor: '#FF69B4'
        },
        duration: {
            name: 'Duration',
            options: [
                { id: 'under4min', name: 'Under 4 minutes', sp: 'EgIYAQ%253D%253D', color: '#32CD32' },
                { id: '4to20min', name: '4 - 20 minutes', sp: 'EgIYAw%253D%253D', color: '#FFA500' },
                { id: 'over20min', name: 'Over 20 minutes', sp: 'EgIYAg%253D%253D', color: '#FF4500' }
            ],
            defaultColor: '#9ACD32'
        },
        features: {
            name: 'Features',
            options: [
                { id: 'live', name: 'Live', sp: 'EgJAAQ%253D%253D', color: '#FF0000' },
                { id: '4k', name: '4K', sp: 'EgJwAQ%253D%253D', color: '#800080' },
                { id: 'hd', name: 'HD', sp: 'EgIgAQ%253D%253D', color: '#0000FF' },
                { id: 'subtitles', name: 'Subtitles/CC', sp: 'EgIoAQ%253D%253D', color: '#008000' },
                { id: 'creativeCommons', name: 'Creative Commons', sp: 'EgIwAQ%253D%253D', color: '#FFA500' },
                { id: '360', name: '360°', sp: 'EgJ4AQ%253D%253D', color: '#FF4500' },
                { id: 'vr180', name: 'VR180', sp: 'EgPQAQE%253D', color: '#FF1493' },
                { id: '3d', name: '3D', sp: 'EgI4AQ%253D%253D', color: '#9400D3' },
                { id: 'hdr', name: 'HDR', sp: 'EgPIAQE%253D', color: '#4B0082' },
                { id: 'location', name: 'Location', sp: 'EgO4AQE%253D', color: '#00CED1' },
                { id: 'purchased', name: 'Purchased', sp: 'EgJIAQ%253D%253D', color: '#20B2AA' }
            ],
            defaultColor: '#32CD32'
        },
        sortBy: {
            name: 'Sort By',
            options: [
                { id: 'relevance', name: 'Relevance', sp: '', color: '#696969' },
                { id: 'uploadDate', name: 'Upload date', sp: 'CAISAA%253D%253D', color: '#FF6F61' },
                { id: 'viewCount', name: 'View count', sp: 'CAMSAA%253D%253D', color: '#FFB085' },
                { id: 'rating', name: 'Rating', sp: 'CAESAA%253D%253D', color: '#FFD700' }
            ],
            defaultColor: '#808080'
        }
    };

    const defaultSettings = {
        defaultFilters: createDefaultFilters(),
        categoryColors: Object.keys(filterConfig).reduce((acc, groupId) => {
            acc[groupId] = filterConfig[groupId].defaultColor;
            acc.options = acc.options || {};
            filterConfig[groupId].options.forEach(option => {
                acc.options[`${groupId}-${option.id}`] = option.color;
            });
            return acc;
        }, {})
    };

    function normalizeSettingsObject(rawSettings) {
        const storedSettings = parseStoredSettings(rawSettings) || {};
        const nextSettings = {
            defaultFilters: createDefaultFilters(storedSettings.defaultFilters || {}),
            categoryColors: {
                options: {}
            }
        };

        Object.keys(filterConfig).forEach(groupId => {
            nextSettings.categoryColors[groupId] =
                typeof storedSettings?.categoryColors?.[groupId] === 'string' && storedSettings.categoryColors[groupId].trim()
                    ? storedSettings.categoryColors[groupId].trim()
                    : filterConfig[groupId].defaultColor;

            filterConfig[groupId].options.forEach(option => {
                const optionKey = `${groupId}-${option.id}`;
                const storedColor = storedSettings?.categoryColors?.options?.[optionKey];
                nextSettings.categoryColors.options[optionKey] =
                    typeof storedColor === 'string' && storedColor.trim() ? storedColor.trim() : option.color;
            });
        });

        return nextSettings;
    }

    function splitLegacyKeywordItems(storedItems) {
        const keywords = [];
        const channels = [];

        if (!Array.isArray(storedItems)) {
            return { keywords, channels };
        }

        storedItems.forEach(item => {
            if (typeof item === 'string') {
                const keywordEntry = createKeywordEntry(item);
                if (keywordEntry.keyword.trim()) {
                    keywords.push(keywordEntry);
                }
                return;
            }

            const keywordValue = typeof item?.keyword === 'string' ? item.keyword : String(item?.keyword ?? '');
            const channelUrl = typeof item?.channelUrl === 'string' ? item.channelUrl.trim() : '';

            if (channelUrl) {
                channels.push(createChannelEntry(keywordValue, channelUrl));
                return;
            }

            const keywordEntry = createKeywordEntry(keywordValue, item);
            if (keywordEntry.keyword.trim()) {
                keywords.push(keywordEntry);
            }
        });

        return { keywords, channels };
    }

    function normalizeChannelEntries(items) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items.reduce((accumulator, item) => {
            const channelEntry = typeof item === 'string'
                ? createChannelEntry('', item)
                : createChannelEntry(item?.label || item?.keyword || '', item?.url || item?.channelUrl || '');

            if (channelEntry.url.trim()) {
                accumulator.push(channelEntry);
            }

            return accumulator;
        }, []);
    }

    function normalizeLinkEntries(items) {
        if (!Array.isArray(items)) {
            return [];
        }

        return items.reduce((accumulator, item) => {
            const linkEntry = typeof item === 'string'
                ? createLinkEntry('', item)
                : createLinkEntry(item?.label || item?.title || '', item?.url || item?.linkUrl || item?.href || '');

            if (linkEntry.url.trim()) {
                accumulator.push(linkEntry);
            }

            return accumulator;
        }, []);
    }

    function getDirectChannelPath(channelValue) {
        const rawValue = typeof channelValue === 'string' ? channelValue.trim() : String(channelValue ?? '').trim();
        if (!rawValue) {
            return '';
        }

        const normalizePath = pathValue => {
            const normalizedPath = String(pathValue ?? '').trim().replace(/^\/+/, '');
            if (!normalizedPath) {
                return '';
            }

            const segments = normalizedPath.split('/').filter(Boolean);
            const firstSegment = segments[0];
            const firstSegmentLower = firstSegment.toLowerCase();
            const secondSegment = segments[1];

            if (/\s/.test(firstSegment) || (secondSegment && /\s/.test(secondSegment))) {
                return '';
            }

            if (firstSegment.startsWith('@')) {
                return `/${firstSegment}`;
            }

            if (['channel', 'c', 'user'].includes(firstSegmentLower) && secondSegment) {
                return `/${firstSegmentLower}/${secondSegment}`;
            }

            if (/^UC[\w-]{20,}$/i.test(firstSegment)) {
                return `/channel/${firstSegment}`;
            }

            return '';
        };

        const directPath = normalizePath(rawValue);
        if (directPath) {
            return directPath;
        }

        const candidateUrl = /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\//i.test(rawValue)
            ? (/^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`)
            : rawValue;

        try {
            const parsedUrl = new URL(candidateUrl);
            if (!/(^|\.)youtube\.com$/i.test(parsedUrl.hostname)) {
                return '';
            }
            return normalizePath(parsedUrl.pathname);
        } catch {
            return '';
        }
    }

    function buildConfiguredChannelUrl(channelValue) {
        const directPath = getDirectChannelPath(channelValue);
        return directPath ? `https://www.youtube.com${directPath}` : '';
    }

    function buildConfiguredLinkUrl(linkValue) {
        const rawValue = typeof linkValue === 'string' ? linkValue.trim() : String(linkValue ?? '').trim();
        if (!rawValue) {
            return '';
        }

        const looksLikeBareDomain = /^(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|(?:[\w-]+\.)+[a-z]{2,})(?::\d+)?(?:[/?#]|$)/i.test(rawValue);
        let candidateValue = rawValue;

        if (rawValue.startsWith('//')) {
            candidateValue = `${window.location.protocol}${rawValue}`;
        } else if (looksLikeBareDomain) {
            candidateValue = `https://${rawValue}`;
        }

        try {
            const parsedUrl = new URL(candidateValue, `${window.location.origin}/`);
            const blockedProtocols = new Set(['javascript:', 'data:', 'vbscript:']);
            return blockedProtocols.has(parsedUrl.protocol.toLowerCase()) ? '' : parsedUrl.href;
        } catch {
            return '';
        }
    }

    function buildChannelTargetUrl(item) {
        return buildConfiguredChannelUrl(item?.url || item?.channelUrl || '');
    }

    function buildLinkTargetUrl(item) {
        return buildConfiguredLinkUrl(item?.url || item?.linkUrl || item?.href || '');
    }

    function mergeChannelEntries(...collections) {
        const seen = new Set();
        const merged = [];

        collections.forEach(collection => {
            normalizeChannelEntries(collection).forEach(item => {
                const key = buildChannelTargetUrl(item) || item.url.trim().toLowerCase();
                if (!key || seen.has(key)) {
                    return;
                }

                seen.add(key);
                merged.push(item);
            });
        });

        return merged;
    }

    function mergeLinkEntries(...collections) {
        const seen = new Set();
        const merged = [];

        collections.forEach(collection => {
            normalizeLinkEntries(collection).forEach(item => {
                const key = buildLinkTargetUrl(item) || item.url.trim();
                if (!key || seen.has(key)) {
                    return;
                }

                seen.add(key);
                merged.push(item);
            });
        });

        return merged;
    }

    function buildSearchUrl(keyword, filters) {
        let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
        const activeSpFilters = [];
        const additionalParams = [];

        if (filters.sortBy && filters.sortBy !== 'relevance') {
            const option = filterConfig.sortBy.options.find(item => item.id === filters.sortBy);
            if (option?.sp) {
                activeSpFilters.push(option.sp);
                if (filters.sortBy === 'uploadDate') {
                    additionalParams.push('sort=dd');
                } else if (filters.sortBy === 'viewCount') {
                    additionalParams.push('sort=vv');
                } else if (filters.sortBy === 'rating') {
                    additionalParams.push('sort=rr');
                }
            }
        }

        if (filters.type) {
            const option = filterConfig.type.options.find(item => item.id === filters.type);
            if (option?.sp) {
                activeSpFilters.push(option.sp);
                additionalParams.push(`filters=${filters.type}`);
            }
        }

        if (filters.uploadDate) {
            const option = filterConfig.uploadDate.options.find(item => item.id === filters.uploadDate);
            if (option?.sp) {
                activeSpFilters.push(option.sp);
            }
        }

        if (filters.duration) {
            const option = filterConfig.duration.options.find(item => item.id === filters.duration);
            if (option?.sp) {
                activeSpFilters.push(option.sp);
            }
        }

        if (Array.isArray(filters.features)) {
            filters.features.forEach(featureId => {
                const option = filterConfig.features.options.find(item => item.id === featureId);
                if (option?.sp) {
                    activeSpFilters.push(option.sp);
                }
            });
        }

        if (activeSpFilters.length > 0) {
            url += `&sp=${activeSpFilters[0]}`;
        }

        if (additionalParams.length > 0) {
            url += `&${additionalParams.join('&')}`;
        }

        return url;
    }

    function buildKeywordTargetUrl(item) {
        return buildSearchUrl(item?.keyword || '', item?.filters || createDefaultFilters());
    }

    function getChannelDisplayLabel(item) {
        const explicitLabel = typeof item?.label === 'string' ? item.label.trim() : '';
        if (explicitLabel) {
            return explicitLabel;
        }

        const rawValue = typeof item?.url === 'string'
            ? item.url.trim()
            : (typeof item?.channelUrl === 'string' ? item.channelUrl.trim() : '');
        const directPath = getDirectChannelPath(rawValue);

        if (!directPath) {
            return rawValue || 'Channel';
        }

        return directPath
            .replace(/^\/(?:channel|c|user)\//i, '')
            .replace(/^\//, '');
    }

    function getLinkDisplayLabel(item) {
        const explicitLabel = typeof item?.label === 'string' ? item.label.trim() : '';
        if (explicitLabel) {
            return explicitLabel;
        }

        const rawValue = typeof item?.url === 'string'
            ? item.url.trim()
            : (typeof item?.linkUrl === 'string' ? item.linkUrl.trim() : (typeof item?.href === 'string' ? item.href.trim() : ''));
        const targetUrl = buildConfiguredLinkUrl(rawValue);

        if (!targetUrl) {
            return rawValue || 'Link';
        }

        try {
            const parsedUrl = new URL(targetUrl);
            if (['mailto:', 'tel:'].includes(parsedUrl.protocol)) {
                return targetUrl.replace(/^[a-z]+:/i, '');
            }

            const host = parsedUrl.hostname + (parsedUrl.port ? `:${parsedUrl.port}` : '');
            const path = parsedUrl.pathname === '/' ? '' : parsedUrl.pathname.replace(/\/$/, '');
            return `${host}${path}${parsedUrl.search}${parsedUrl.hash}` || targetUrl;
        } catch {
            return rawValue || targetUrl;
        }
    }

    function getSuggestedChannelLabel(targetUrl, fallbackValue = targetUrl) {
        const currentChannelUrl = buildConfiguredChannelUrl(window.location.href);
        const currentPageTitle = document.title.replace(/\s*-\s*YouTube\s*$/i, '').trim();
        if (targetUrl && currentChannelUrl === targetUrl && currentPageTitle) {
            return currentPageTitle;
        }

        return getChannelDisplayLabel({ url: fallbackValue || targetUrl });
    }

    function getSuggestedLinkLabel(targetUrl, fallbackValue = targetUrl) {
        const currentLinkUrl = buildConfiguredLinkUrl(window.location.href);
        const currentPageTitle = document.title.replace(/\s*-\s*YouTube\s*$/i, '').trim();
        if (targetUrl && currentLinkUrl === targetUrl && currentPageTitle) {
            return currentPageTitle;
        }

        return getLinkDisplayLabel({ url: fallbackValue || targetUrl });
    }

    function createSettingsModal(ctx) {
        const settingsModal = document.createElement('div');
        settingsModal.id = `${NAMESPACE}-settings-modal`;
        settingsModal.className = `${NAMESPACE}-sync-modal ${NAMESPACE}-centered-modal`;
        settingsModal.style.display = 'none';

        const modalContent = document.createElement('div');
        modalContent.className = `${NAMESPACE}-sync-modal-content`;

        const header = document.createElement('div');
        header.className = `${NAMESPACE}-sync-modal-header`;

        const title = document.createElement('h2');
        title.textContent = 'Settings';
        header.appendChild(title);

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = `${NAMESPACE}-sync-modal-close-btn`;
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            settingsModal.style.display = 'none';
            ctx.hideModalBackdrop();
        });
        header.appendChild(closeButton);

        const body = document.createElement('div');
        body.className = `${NAMESPACE}-settings-modal-body`;

        const tabContainer = document.createElement('div');
        tabContainer.className = `${NAMESPACE}-tab-container`;
        tabContainer.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';

        const filterTabButton = document.createElement('button');
        filterTabButton.type = 'button';
        filterTabButton.className = `${NAMESPACE}-tab-button ${NAMESPACE}-active-tab`;
        filterTabButton.textContent = 'Default Filter Settings';

        const colorTabButton = document.createElement('button');
        colorTabButton.type = 'button';
        colorTabButton.className = `${NAMESPACE}-tab-button`;
        colorTabButton.textContent = 'Filter Category Colors';

        tabContainer.appendChild(filterTabButton);
        tabContainer.appendChild(colorTabButton);
        body.appendChild(tabContainer);

        const tabContentContainer = document.createElement('div');
        tabContentContainer.className = `${NAMESPACE}-tab-content-container`;

        const filterTabContent = document.createElement('div');
        filterTabContent.className = `${NAMESPACE}-tab-content`;
        filterTabContent.style.display = 'block';

        const filterSection = document.createElement('div');
        filterSection.className = `${NAMESPACE}-settings-section`;

        const filterTitle = document.createElement('h3');
        filterTitle.className = `${NAMESPACE}-settings-subtitle`;
        filterTitle.textContent = 'Default Filter Settings';
        filterSection.appendChild(filterTitle);

        const filterGrid = document.createElement('div');
        filterGrid.className = `${NAMESPACE}-filter-grid`;

        const selectRefs = {};
        ['type', 'uploadDate', 'duration', 'sortBy'].forEach(groupId => {
            const group = filterConfig[groupId];
            const filterItem = document.createElement('div');
            filterItem.className = `${NAMESPACE}-filter-item`;

            const label = document.createElement('label');
            label.className = `${NAMESPACE}-settings-label`;
            label.textContent = `${group.name}:`;

            const select = document.createElement('select');
            select.id = `${NAMESPACE}-default-${groupId}-select`;
            select.className = `${NAMESPACE}-settings-select`;
            select.dataset.group = groupId;

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'None';
            select.appendChild(emptyOption);

            group.options.forEach(optionData => {
                const option = document.createElement('option');
                option.value = optionData.id;
                option.textContent = optionData.name;
                select.appendChild(option);
            });

            filterItem.appendChild(label);
            filterItem.appendChild(select);
            filterGrid.appendChild(filterItem);
            selectRefs[groupId] = select;
        });

        const featuresItem = document.createElement('div');
        featuresItem.className = `${NAMESPACE}-filter-item ${NAMESPACE}-multi-select-item`;

        const featuresLabel = document.createElement('label');
        featuresLabel.className = `${NAMESPACE}-settings-label`;
        featuresLabel.textContent = `${filterConfig.features.name}:`;
        featuresItem.appendChild(featuresLabel);

        const featuresContainer = document.createElement('div');
        featuresContainer.className = `${NAMESPACE}-checkbox-container`;
        const featureCheckboxes = [];

        filterConfig.features.options.forEach(optionData => {
            const wrapper = document.createElement('div');
            wrapper.className = `${NAMESPACE}-checkbox-wrapper`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = `${NAMESPACE}-feature-checkbox`;
            checkbox.id = `${NAMESPACE}-default-features-${optionData.id}`;
            checkbox.value = optionData.id;

            const label = document.createElement('label');
            label.className = `${NAMESPACE}-checkbox-label`;
            label.htmlFor = checkbox.id;
            label.textContent = optionData.name;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            featuresContainer.appendChild(wrapper);
            featureCheckboxes.push(checkbox);
        });

        featuresItem.appendChild(featuresContainer);
        filterGrid.appendChild(featuresItem);
        filterSection.appendChild(filterGrid);
        filterTabContent.appendChild(filterSection);

        const colorTabContent = document.createElement('div');
        colorTabContent.className = `${NAMESPACE}-tab-content`;
        colorTabContent.style.display = 'none';

        const colorSection = document.createElement('div');
        colorSection.className = `${NAMESPACE}-settings-section`;

        const colorTitle = document.createElement('h3');
        colorTitle.className = `${NAMESPACE}-settings-subtitle`;
        colorTitle.textContent = 'Filter Category Colors';
        colorSection.appendChild(colorTitle);

        const colorGrid = document.createElement('div');
        colorGrid.className = `${NAMESPACE}-color-grid`;
        const groupColorInputs = new Map();
        const optionColorInputs = new Map();

        Object.entries(filterConfig).forEach(([groupId, group]) => {
            const colorItem = document.createElement('div');
            colorItem.className = `${NAMESPACE}-color-item`;

            const labelColorContainer = document.createElement('div');
            labelColorContainer.className = `${NAMESPACE}-label-color-container`;

            const colorLabel = document.createElement('label');
            colorLabel.className = `${NAMESPACE}-settings-label`;
            colorLabel.textContent = `${group.name}:`;

            const tagPreview = document.createElement('div');
            tagPreview.className = `${NAMESPACE}-tag-preview`;
            tagPreview.dataset.category = groupId;

            const sampleText = document.createElement('span');
            sampleText.textContent = 'Preview';

            const categoryBadge = document.createElement('span');
            categoryBadge.className = `${NAMESPACE}-preview-badge`;
            categoryBadge.textContent = group.name;

            tagPreview.appendChild(sampleText);
            tagPreview.appendChild(categoryBadge);

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = `${NAMESPACE}-color-input`;
            colorInput.dataset.category = groupId;

            const updateGroupPreview = color => {
                categoryBadge.style.backgroundColor = color;
                tagPreview.style.borderColor = color;
            };

            colorInput.addEventListener('input', event => {
                updateGroupPreview(event.target.value);
            });

            labelColorContainer.appendChild(colorLabel);
            labelColorContainer.appendChild(tagPreview);
            labelColorContainer.appendChild(colorInput);
            colorItem.appendChild(labelColorContainer);
            groupColorInputs.set(groupId, { input: colorInput, updateGroupPreview });

            const optionsContainer = document.createElement('div');
            optionsContainer.className = `${NAMESPACE}-options-color-container`;

            group.options.forEach(optionData => {
                const optionKey = `${groupId}-${optionData.id}`;
                const optionItem = document.createElement('div');
                optionItem.className = `${NAMESPACE}-option-color-item`;

                const optionLabel = document.createElement('label');
                optionLabel.className = `${NAMESPACE}-option-settings-label`;
                optionLabel.textContent = `${optionData.name}:`;

                const optionPreview = document.createElement('div');
                optionPreview.className = `${NAMESPACE}-option-tag-preview`;
                optionPreview.dataset.option = optionKey;

                const optionSampleText = document.createElement('span');
                optionSampleText.textContent = 'Preview';

                const optionBadge = document.createElement('span');
                optionBadge.className = `${NAMESPACE}-option-preview-badge`;
                optionBadge.textContent = optionData.name;

                optionPreview.appendChild(optionSampleText);
                optionPreview.appendChild(optionBadge);

                const optionColorInput = document.createElement('input');
                optionColorInput.type = 'color';
                optionColorInput.className = `${NAMESPACE}-option-color-input`;
                optionColorInput.dataset.option = optionKey;

                const updateOptionPreview = color => {
                    optionBadge.style.backgroundColor = color;
                    optionPreview.style.borderColor = color;
                };

                optionColorInput.addEventListener('input', event => {
                    updateOptionPreview(event.target.value);
                });

                optionItem.appendChild(optionLabel);
                optionItem.appendChild(optionPreview);
                optionItem.appendChild(optionColorInput);
                optionsContainer.appendChild(optionItem);

                optionColorInputs.set(optionKey, { input: optionColorInput, updateOptionPreview });
            });

            colorItem.appendChild(optionsContainer);
            colorGrid.appendChild(colorItem);
        });

        colorSection.appendChild(colorGrid);
        colorTabContent.appendChild(colorSection);

        tabContentContainer.appendChild(filterTabContent);
        tabContentContainer.appendChild(colorTabContent);
        body.appendChild(tabContentContainer);

        const footer = document.createElement('div');
        footer.className = `${NAMESPACE}-settings-footer`;

        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.className = `${NAMESPACE}-settings-btn ${NAMESPACE}-reset-btn`;
        resetButton.textContent = 'Reset Defaults';

        const saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = `${NAMESPACE}-settings-btn ${NAMESPACE}-save-btn`;
        saveButton.textContent = 'Save Settings';

        footer.appendChild(resetButton);
        footer.appendChild(saveButton);
        body.appendChild(footer);

        modalContent.appendChild(header);
        modalContent.appendChild(body);
        settingsModal.appendChild(modalContent);
        settingsModal.addEventListener('click', event => event.stopPropagation());

        const showFilterTab = () => {
            filterTabButton.classList.add(`${NAMESPACE}-active-tab`);
            colorTabButton.classList.remove(`${NAMESPACE}-active-tab`);
            filterTabContent.style.display = 'block';
            colorTabContent.style.display = 'none';
        };

        const showColorTab = () => {
            colorTabButton.classList.add(`${NAMESPACE}-active-tab`);
            filterTabButton.classList.remove(`${NAMESPACE}-active-tab`);
            filterTabContent.style.display = 'none';
            colorTabContent.style.display = 'block';
        };

        filterTabButton.addEventListener('click', showFilterTab);
        colorTabButton.addEventListener('click', showColorTab);

        async function syncFromSettings() {
            const settings = await ctx.getSettings();
            const normalizedSettings = normalizeSettingsObject(settings);

            Object.entries(selectRefs).forEach(([groupId, select]) => {
                select.value = groupId === 'sortBy'
                    ? (normalizedSettings.defaultFilters[groupId] || 'relevance')
                    : (normalizedSettings.defaultFilters[groupId] || '');
            });

            featureCheckboxes.forEach(checkbox => {
                checkbox.checked = normalizedSettings.defaultFilters.features.includes(checkbox.value);
            });

            groupColorInputs.forEach((ref, groupId) => {
                const color = normalizedSettings.categoryColors[groupId] || filterConfig[groupId].defaultColor;
                ref.input.value = color;
                ref.updateGroupPreview(color);
            });

            optionColorInputs.forEach((ref, optionKey) => {
                const color = normalizedSettings.categoryColors.options[optionKey];
                ref.input.value = color;
                ref.updateOptionPreview(color);
            });

            showFilterTab();
        }

        resetButton.addEventListener('click', async () => {
            const settings = normalizeSettingsObject(defaultSettings);

            Object.entries(selectRefs).forEach(([groupId, select]) => {
                select.value = groupId === 'sortBy'
                    ? (settings.defaultFilters[groupId] || 'relevance')
                    : (settings.defaultFilters[groupId] || '');
            });

            featureCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            groupColorInputs.forEach((ref, groupId) => {
                const color = filterConfig[groupId].defaultColor;
                ref.input.value = color;
                ref.updateGroupPreview(color);
            });

            optionColorInputs.forEach((ref, optionKey) => {
                const [groupId, optionId] = optionKey.split('-');
                const color = filterConfig[groupId].options.find(option => option.id === optionId)?.color || '#808080';
                ref.input.value = color;
                ref.updateOptionPreview(color);
            });
        });

        saveButton.addEventListener('click', async () => {
            const settings = {
                defaultFilters: {
                    uploadDate: selectRefs.uploadDate.value || '',
                    type: selectRefs.type.value || '',
                    duration: selectRefs.duration.value || '',
                    features: featureCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value),
                    sortBy: selectRefs.sortBy.value || 'relevance'
                },
                categoryColors: {
                    options: {}
                }
            };

            groupColorInputs.forEach((ref, groupId) => {
                settings.categoryColors[groupId] = ref.input.value;
            });

            optionColorInputs.forEach((ref, optionKey) => {
                settings.categoryColors.options[optionKey] = ref.input.value;
            });

            await ctx.saveSettings(settings);
            settingsModal.style.display = 'none';
            ctx.hideModalBackdrop();
            await ctx.refreshPanelLists();
            ctx.showNotification('Settings saved');
            await syncFromSettings();
        });

        settingsModal.syncFromSettings = syncFromSettings;
        settingsModal.syncFromSettings();

        return settingsModal;
    }

    function createKeywordFilterEditor(ctx, idPrefix) {
        const filterGroups = document.createElement('div');
        filterGroups.className = `${NAMESPACE}-edit-filter-groups`;

        const selectRefs = {};
        ['type', 'uploadDate', 'duration', 'sortBy'].forEach(groupId => {
            const group = filterConfig[groupId];
            const filterGroup = document.createElement('div');
            filterGroup.className = `${NAMESPACE}-edit-filter-group`;

            const label = document.createElement('label');
            label.className = `${NAMESPACE}-edit-filter-label`;
            label.textContent = `${group.name}:`;

            const select = document.createElement('select');
            select.id = `${NAMESPACE}-${idPrefix}-${groupId}-select`;
            select.className = `${NAMESPACE}-edit-filter-select`;
            select.dataset.group = groupId;

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'None';
            select.appendChild(emptyOption);

            group.options.forEach(optionData => {
                const option = document.createElement('option');
                option.value = optionData.id;
                option.textContent = optionData.name;
                select.appendChild(option);
            });

            filterGroup.appendChild(label);
            filterGroup.appendChild(select);
            filterGroups.appendChild(filterGroup);
            selectRefs[groupId] = select;
        });

        const featuresGroup = document.createElement('div');
        featuresGroup.className = `${NAMESPACE}-edit-filter-group ${NAMESPACE}-edit-features-group`;

        const featuresLabel = document.createElement('label');
        featuresLabel.className = `${NAMESPACE}-edit-filter-label`;
        featuresLabel.textContent = `${filterConfig.features.name}:`;
        featuresGroup.appendChild(featuresLabel);

        const featuresContainer = document.createElement('div');
        featuresContainer.className = `${NAMESPACE}-edit-checkbox-container`;
        const featureCheckboxes = [];

        filterConfig.features.options.forEach(optionData => {
            const wrapper = document.createElement('div');
            wrapper.className = `${NAMESPACE}-edit-checkbox-wrapper`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = `${NAMESPACE}-edit-feature-checkbox`;
            checkbox.id = `${NAMESPACE}-${idPrefix}-features-${optionData.id}`;
            checkbox.value = optionData.id;

            const label = document.createElement('label');
            label.className = `${NAMESPACE}-edit-checkbox-label`;
            label.htmlFor = checkbox.id;
            label.textContent = optionData.name;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            featuresContainer.appendChild(wrapper);
            featureCheckboxes.push(checkbox);
        });

        featuresGroup.appendChild(featuresContainer);
        filterGroups.appendChild(featuresGroup);

        async function colorizeSelectOptions(select, groupId) {
            const options = Array.from(select.options);
            for (const option of options) {
                if (option.value) {
                    option.style.color = await ctx.getOptionColor(groupId, option.value);
                }
            }
        }

        return {
            container: filterGroups,
            readFilters() {
                return {
                    uploadDate: selectRefs.uploadDate.value || '',
                    type: selectRefs.type.value || '',
                    duration: selectRefs.duration.value || '',
                    features: featureCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value),
                    sortBy: selectRefs.sortBy.value || 'relevance'
                };
            },
            writeFilters(rawFilters = {}) {
                const filters = createDefaultFilters(rawFilters);
                Object.entries(selectRefs).forEach(([groupId, select]) => {
                    select.value = groupId === 'sortBy' ? (filters[groupId] || 'relevance') : (filters[groupId] || '');
                    colorizeSelectOptions(select, groupId);
                });

                featureCheckboxes.forEach(checkbox => {
                    checkbox.checked = filters.features.includes(checkbox.value);
                });
            }
        };
    }

    async function renderKeywordBadges({ item, searchButton, createFilterBadge, getOptionColor }) {
        const filters = createDefaultFilters(item.filters);

        for (const [groupId, value] of Object.entries(filters)) {
            if (groupId === 'features') {
                for (const featureId of value) {
                    const option = filterConfig.features.options.find(candidate => candidate.id === featureId);
                    if (option) {
                        const badge = createFilterBadge(groupId, featureId, option.name);
                        badge.style.backgroundColor = await getOptionColor(groupId, featureId);
                        searchButton.appendChild(badge);
                    }
                }
                continue;
            }

            if (!value || (groupId === 'sortBy' && value === 'relevance')) {
                continue;
            }

            const option = filterConfig[groupId]?.options.find(candidate => candidate.id === value);
            if (!option) {
                continue;
            }

            const badge = createFilterBadge(groupId, value, option.name);
            badge.style.backgroundColor = await getOptionColor(groupId, value);
            searchButton.appendChild(badge);
        }
    }

    function getSearchContext() {
        const searchSelectors = [
            'input[name="search_query"]',
            '#search-form input#search',
            '.ytSearchboxComponentInputBox input'
        ];

        for (const selector of searchSelectors) {
            const searchInput = document.querySelector(selector);
            if (!searchInput) {
                continue;
            }

            const searchContainer = searchInput.closest('form') || searchInput.parentElement;
            if (!searchContainer) {
                continue;
            }

            searchContainer.style.position = 'relative';

            return {
                searchInput,
                searchContainer,
                panelAnchor: searchContainer,
                attachButton(button) {
                    searchContainer.appendChild(button);
                },
                applyLayout({ isMobile, keywordButton }) {
                    keywordButton.style.cssText += `
                        font-size: ${isMobile ? '14px' : '16px'} !important;
                        right: ${isMobile ? '5px' : '9px'} !important;
                        width: ${isMobile ? '18px' : '22px'} !important;
                        height: ${isMobile ? '18px' : '22px'} !important;
                        min-width: ${isMobile ? '18px' : '22px'} !important;
                        min-height: ${isMobile ? '18px' : '22px'} !important;
                        margin-right: ${isMobile ? '18px' : '22px'} !important;
                    `;

                    const input = searchContainer.querySelector('input[type="text"], .search-input-el') || searchInput;
                    if (input) {
                        input.style.cssText += `
                            padding-right: ${isMobile ? '32px' : '36px'} !important;
                            box-sizing: border-box !important;
                            width: 100% !important;
                        `;
                    }
                },
                positionPanel({ repositionDefaultPanel, clearFixedPanelTransform }) {
                    clearFixedPanelTransform();
                    repositionDefaultPanel(searchContainer);
                }
            };
        }

        return null;
    }

    return {
        siteId: 'youtube',
        namespace: NAMESPACE,
        templateVersion: SITE_VERSION,
        menuCommandLabel: 'Manage Keywords',
        filterConfig,
        ui: {
            syncTitle: 'Sync',
            settingsTitle: 'Settings',
            importTitle: 'Import Data',
            exportTitle: 'Export Data',
            importSuccessText: 'Data imported successfully!',
            invalidImportText: 'Invalid import file format!',
            importParseErrorText: 'Failed to parse import file!',
            keywordButtonText: '🏷️'
        },
        settings: {
            storageKey: 'yt_settings',
            defaultValue: defaultSettings,
            normalize: normalizeSettingsObject,
            getGroupColor(settings, groupId) {
                return settings.categoryColors[groupId] || filterConfig[groupId]?.defaultColor || '#808080';
            },
            getOptionColor(settings, groupId, optionId) {
                return settings.categoryColors.options[`${groupId}-${optionId}`]
                    || filterConfig[groupId]?.options.find(option => option.id === optionId)?.color
                    || '#808080';
            },
            createModal: createSettingsModal
        },
        storage: {
            async migrate() {
                const storedKeywords = await GM.getValue('yt_keywords', null);
                if (Array.isArray(storedKeywords)) {
                    const hasLegacyChannelUrls = storedKeywords.some(item => (
                        item && typeof item === 'object' && typeof item.channelUrl === 'string' && item.channelUrl.trim()
                    ));

                    if (hasLegacyChannelUrls) {
                        const { keywords, channels } = splitLegacyKeywordItems(storedKeywords);
                        const storedChannels = await GM.getValue('yt_channels', null);
                        await GM.setValue('yt_keywords', keywords);
                        await GM.setValue('yt_channels', mergeChannelEntries(storedChannels, channels));
                    }
                }

                const storedSettings = await GM.getValue('yt_settings', null);
                if (storedSettings !== null) {
                    await GM.setValue('yt_settings', JSON.stringify(normalizeSettingsObject(storedSettings)));
                }
            }
        },
        keyword: {
            icon: '🔍',
            title: 'Saved Keywords',
            tabLabel: 'Keywords',
            addButtonLabel: 'Add keyword',
            editButtonTitle: 'Edit keyword',
            editModalTitle: 'Edit Keyword',
            createModalTitle: 'Add Keyword',
            fieldLabel: 'Keyword',
            fieldPlaceholder: 'Keyword',
            emptyAlert: 'Keyword cannot be empty!',
            duplicateAlert: 'Keyword already exists!',
            deleteButtonText: 'Delete',
            saveButtonText: 'Save',
            createButtonText: 'Add',
            collection: {
                storageKey: 'yt_keywords',
                read(stored) {
                    return Array.isArray(stored) ? splitLegacyKeywordItems(stored).keywords : [];
                },
                write(items) {
                    return Array.isArray(items)
                        ? items
                            .map(item => (typeof item === 'string' ? createKeywordEntry(item) : createKeywordEntry(item?.keyword, item)))
                            .filter(item => item.keyword.trim())
                        : [];
                },
                getDefaultItems() {
                    return defaultKeywords.map(item => createKeywordEntry(item.keyword, item));
                }
            },
            createEntry: createKeywordEntry,
            createDefaultFilters,
            createFilterEditor: createKeywordFilterEditor,
            getDuplicateKey(item) {
                return item.keyword.trim();
            },
            buildTargetUrl: buildKeywordTargetUrl,
            getSearchButtonMeta(item) {
                const isChannelSearch = item.filters?.type === 'channel';
                return {
                    title: isChannelSearch ? 'Search channels by keyword' : 'Search keyword',
                    ariaLabel: isChannelSearch
                        ? `Search channels for ${item.keyword}`
                        : `Search ${item.keyword}`
                };
            },
            renderBadges: renderKeywordBadges
        },
        namedCollections: [
            {
                id: 'channels',
                exportKey: 'channels',
                modalId: 'channel',
                storageKey: 'yt_channels',
                icon: '📺',
                title: 'Saved Channels',
                tabLabel: 'Channels',
                addButtonLabel: 'Add channel',
                editButtonTitle: 'Edit channel',
                editModalTitle: 'Edit Channel',
                createModalTitle: 'Add Channel',
                labelFieldLabel: 'Label',
                labelFieldPlaceholder: 'Optional label',
                valueFieldLabel: 'Channel URL',
                valueFieldPlaceholder: 'Channel URL or @handle',
                emptyAlert: 'Channel URL cannot be empty!',
                invalidAlert: 'Invalid channel URL or handle!',
                duplicateAlert: 'Channel already exists!',
                openTitle: 'Open channel',
                invalidTitle: 'Invalid channel URL',
                deleteButtonText: 'Delete',
                saveButtonText: 'Save',
                createButtonText: 'Add',
                read: normalizeChannelEntries,
                write(items) {
                    return mergeChannelEntries(items);
                },
                getDefaultItems() {
                    return [];
                },
                createEntry: createChannelEntry,
                normalizeTargetValue: buildConfiguredChannelUrl,
                buildTargetUrl: buildChannelTargetUrl,
                getDisplayLabel: getChannelDisplayLabel,
                getSuggestedLabel: getSuggestedChannelLabel,
                getCreateInitialValue() {
                    return window.location.href;
                }
            },
            {
                id: 'links',
                exportKey: 'links',
                modalId: 'link',
                storageKey: 'yt_links',
                icon: '🔗',
                title: 'Saved Links',
                tabLabel: 'Links',
                addButtonLabel: 'Add link',
                editButtonTitle: 'Edit link',
                editModalTitle: 'Edit Link',
                createModalTitle: 'Add Link',
                labelFieldLabel: 'Label',
                labelFieldPlaceholder: 'Optional label',
                valueFieldLabel: 'Link URL',
                valueFieldPlaceholder: 'Any URL, domain, or path',
                emptyAlert: 'Link URL cannot be empty!',
                invalidAlert: 'Invalid link URL!',
                duplicateAlert: 'Link already exists!',
                openTitle: 'Open link',
                invalidTitle: 'Invalid link',
                deleteButtonText: 'Delete',
                saveButtonText: 'Save',
                createButtonText: 'Add',
                read: normalizeLinkEntries,
                write(items) {
                    return mergeLinkEntries(items);
                },
                getDefaultItems() {
                    return [];
                },
                createEntry: createLinkEntry,
                normalizeTargetValue: buildConfiguredLinkUrl,
                buildTargetUrl: buildLinkTargetUrl,
                getDisplayLabel: getLinkDisplayLabel,
                getSuggestedLabel: getSuggestedLinkLabel,
                getCreateInitialValue() {
                    return window.location.href;
                }
            }
        ],
        importExport: {
            fileName: 'youtube_Keywords_Search.json',
            async normalizeImportedData(importedData, ctx) {
                let formattedKeywords = null;
                let formattedChannels = null;
                let formattedLinks = null;

                if (Array.isArray(importedData)) {
                    const splitData = splitLegacyKeywordItems(importedData);
                    formattedKeywords = splitData.keywords;
                    formattedChannels = splitData.channels;
                    formattedLinks = await ctx.getItems('links');
                } else if (importedData && typeof importedData === 'object') {
                    const hasKeywordArray = Array.isArray(importedData.keywords);
                    const hasChannelArray = Array.isArray(importedData.channels);
                    const hasLinkArray = Array.isArray(importedData.links);

                    if (hasKeywordArray || hasChannelArray || hasLinkArray) {
                        const splitKeywords = splitLegacyKeywordItems(hasKeywordArray ? importedData.keywords : await ctx.getItems('keywords'));
                        formattedKeywords = splitKeywords.keywords;
                        formattedChannels = hasChannelArray
                            ? mergeChannelEntries(splitKeywords.channels, importedData.channels || [])
                            : mergeChannelEntries(await ctx.getItems('channels'), splitKeywords.channels);
                        formattedLinks = hasLinkArray
                            ? mergeLinkEntries(importedData.links || [])
                            : await ctx.getItems('links');
                    }
                }

                if (formattedKeywords && formattedChannels && formattedLinks) {
                    return {
                        keywords: formattedKeywords,
                        channels: formattedChannels,
                        links: formattedLinks
                    };
                }

                return null;
            }
        },
        dom: {
            pageMatches(url) {
                return url.includes('youtube.com');
            },
            getSearchContext
        }
    };
})();

if (!globalThis.KSETemplateRuntime || typeof globalThis.KSETemplateRuntime.bootstrap !== 'function') {
    console.error('[YouTube KSE] Shared template runtime failed to load.');
    throw new Error('[YouTube KSE] Shared template runtime failed to load.');
}

globalThis.KSETemplateRuntime.bootstrap(siteDefinition);
