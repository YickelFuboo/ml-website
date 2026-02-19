<template>
  <div class="knowledge-manage-tab">
    <Teleport to="body">
      <div v-if="showAddDialog" class="dialog-mask">
        <div class="dialog">
          <div class="dialog-head">
            <span class="dialog-title">新增知识库</span>
            <button type="button" class="dialog-close" aria-label="关闭" @click="showAddDialog = false">×</button>
          </div>
          <div class="dialog-body">
            <div class="field">
              <label>知识库名称</label>
              <input v-model="addForm.name" type="text" placeholder="必填" />
            </div>
            <div class="field">
              <label>知识库类型</label>
              <select v-model="addForm.category" class="field-select" required>
                <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.display_name }}</option>
              </select>
            </div>
            <div class="field">
              <label>文档数量上限</label>
              <input v-model.number="addForm.doc_num_limit" type="number" min="0" placeholder="0 表示不限制" />
              <span class="field-hint">0 表示不限制</span>
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn" @click="showAddDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="!addForm.name.trim() || saving" @click="submitAdd">确定</button>
          </div>
        </div>
      </div>
      <div v-if="showEditDialog" class="dialog-mask">
        <div class="dialog dialog-edit-kb">
          <div class="dialog-head">
            <span class="dialog-title">编辑知识库</span>
            <button type="button" class="dialog-close" aria-label="关闭" @click="showEditDialog = false">×</button>
          </div>
          <div class="dialog-body">
            <div v-if="editDetailLoading" class="edit-loading">加载详情中…</div>
            <template v-else>
              <div class="field">
                <label>知识库名称</label>
                <input v-model="editForm.name" type="text" placeholder="必填" />
              </div>
              <div class="field">
                <label>描述</label>
                <textarea v-model="editForm.description" rows="2" placeholder="选填" class="field-textarea" />
              </div>
              <div class="field">
                <label>文档数量上限</label>
                <input v-model.number="editForm.doc_num_limit" type="number" min="0" placeholder="0 表示不限制" />
                <span class="field-hint">0 表示不限制可添加的文档数</span>
              </div>
              <div class="field">
                <label>知识库类型</label>
                <select v-model="editForm.category" class="field-select" required>
                  <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.display_name }}</option>
                </select>
              </div>
            </template>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn" @click="showEditDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="editDetailLoading || !editForm.name?.trim() || saving" @click="submitEdit">确定</button>
          </div>
        </div>
      </div>
      <div v-if="showDocEditDialog" class="dialog-mask">
        <div class="dialog">
          <div class="dialog-head">
            <span class="dialog-title">修改文档描述</span>
            <button type="button" class="dialog-close" aria-label="关闭" @click="showDocEditDialog = false">×</button>
          </div>
          <div class="dialog-body">
            <div class="field">
              <label>文档</label>
              <div class="field-readonly">{{ docEditForm.doc?.name ?? '' }}</div>
            </div>
            <div class="field">
              <label>描述</label>
              <textarea v-model="docEditForm.description" rows="3" placeholder="选填" class="field-textarea" />
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn" @click="showDocEditDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="docEditSaving" @click="submitDocEdit">保存</button>
          </div>
        </div>
      </div>
      <div v-if="showConfigDialog" class="dialog-mask">
        <div class="dialog dialog-config">
          <div class="dialog-head">
            <span class="dialog-title">知识库配置</span>
            <button type="button" class="dialog-close" aria-label="关闭" @click="showConfigDialog = false">×</button>
          </div>
          <div v-if="!configDetailLoading" class="config-tabs">
            <button type="button" class="config-tab" :class="{ active: configTab === 'model' }" @click="configTab = 'model'">模型配置</button>
            <button type="button" class="config-tab" :class="{ active: configTab === 'parser' }" @click="configTab = 'parser'">解析配置</button>
          </div>
          <div class="dialog-body">
            <div v-if="configDetailLoading" class="edit-loading">加载配置中…</div>
            <template v-else>
              <div class="field">
                <label>知识库</label>
                <div class="field-readonly">{{ configKbName }}</div>
              </div>
              <template v-if="configTab === 'model'">
                <div class="config-section">嵌入模型</div>
                <div class="field">
                  <label>嵌入模型 (embd_model_name)</label>
                  <select v-model="selectedEmbeddingModel" class="field-select" :disabled="modelsLoading || configDetailLoading">
                    <option value="">请选择模型</option>
                    <option v-for="opt in embeddingModelOptions" :key="opt.value" :value="opt.value">{{ opt.display }}</option>
                  </select>
                  <span v-if="modelsLoading" class="field-hint">加载模型中…</span>
                  <span v-else-if="!embeddingModelOptions.length" class="field-hint">暂无可用模型</span>
                </div>
                <div class="config-section">重排模型</div>
                <div class="field">
                  <label>重排模型 (rerank_model_name)</label>
                  <select v-model="selectedRerankModel" class="field-select" :disabled="modelsLoading || configDetailLoading">
                    <option value="">请选择模型</option>
                    <option v-for="opt in rerankModelOptions" :key="opt.value" :value="opt.value">{{ opt.display }}</option>
                  </select>
                  <span v-if="modelsLoading" class="field-hint">加载模型中…</span>
                  <span v-else-if="!rerankModelOptions.length" class="field-hint">暂无可用模型</span>
                </div>
              </template>
              <template v-if="configTab === 'parser'">
                <div class="config-section">解析器</div>
                <div class="field">
                  <label>解析器 ID (parser_id)</label>
                  <input v-model="configForm.parser_id" type="text" maxlength="32" placeholder="如 general" />
                </div>
                <div class="field">
                  <label>页面范围 (pages)</label>
                  <input v-model="parserConfigPagesStr" type="text" placeholder="[[1, 1000000]]" class="field-monospace" />
                  <span class="field-hint">JSON 数组格式，如 [[起始页, 结束页]]，表示需要解析的页码范围</span>
                </div>
                <div class="field">
                  <label>每块最大 token 数 (chunk_token_num)</label>
                  <input v-model.number="configForm.parser_config.chunk_token_num" type="number" min="1" max="2048" placeholder="512" />
                  <span class="field-hint">范围 1-2048，默认 512，表示每个文本块的最大 token 数量</span>
                </div>
                <div class="field">
                  <label>分隔符 (delimiter)</label>
                  <input v-model="configForm.parser_config.delimiter" type="text" placeholder="\n!?。；！？" />
                  <span class="field-hint">用于分割文本的分隔符，如换行符、标点符号等</span>
                </div>
                <div class="field">
                  <label>每任务页数 (task_page_size)</label>
                  <input v-model.number="configForm.parser_config.task_page_size" type="number" min="1" max="128" placeholder="12" />
                  <span class="field-hint">范围 1-128，默认 12，表示每个处理任务包含的页面数量</span>
                </div>
                <div class="field">
                  <label>布局识别方式 (layout_recognize)</label>
                  <select v-model="configForm.parser_config.layout_recognize" class="field-select">
                    <option value="DeepDOC">DeepDOC</option>
                    <option value="Plain Text">Plain Text</option>
                  </select>
                  <span class="field-hint">DeepDOC 使用深度学习识别布局，Plain Text 为纯文本模式</span>
                </div>
                <div class="field">
                  <label>自动生成关键词数量 (auto_keywords)</label>
                  <input v-model.number="configForm.parser_config.auto_keywords" type="number" min="0" max="32" placeholder="0" />
                  <span class="field-hint">范围 0-32，0 表示不生成关键词</span>
                </div>
                <div class="field">
                  <label>自动生成问题数量 (auto_questions)</label>
                  <input v-model.number="configForm.parser_config.auto_questions" type="number" min="0" max="10" placeholder="0" />
                  <span class="field-hint">范围 0-10，0 表示不生成问题</span>
                </div>
                <div class="field">
                  <label>Excel 转 HTML (html4excel)</label>
                  <select v-model="configForm.parser_config.html4excel" class="field-select">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                  <span class="field-hint">启用后将 Excel 文件转换为 HTML 格式进行处理</span>
                </div>
                <div class="field">
                  <label>标签数量 (topn_tags)</label>
                  <input v-model.number="configForm.parser_config.topn_tags" type="number" min="1" max="10" placeholder="3" />
                  <span class="field-hint">范围 1-10，默认 3，表示提取的标签数量</span>
                </div>
                <div class="field">
                  <label>标签来源知识库 ID 列表 (tag_kb_ids)</label>
                  <input v-model="parserConfigTagKbIdsStr" type="text" placeholder="[]" class="field-monospace" />
                  <span class="field-hint">JSON 数组格式，指定从哪些知识库中获取标签，空数组表示不使用外部标签</span>
                </div>
                <div class="field">
                  <label>文件名向量权重 (filename_embd_weight)</label>
                  <input v-model.number="configForm.parser_config.filename_embd_weight" type="number" min="0" max="1" step="0.1" placeholder="0.1" />
                  <span class="field-hint">范围 0.0-1.0，默认 0.1，表示文件名在向量化计算中的权重比例</span>
                </div>
                <div class="config-section config-section-group">RAPTOR</div>
                <div class="field">
                  <label>是否启用 RAPTOR (use_raptor)</label>
                  <select v-model="configForm.parser_config.raptor.use_raptor" class="field-select">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                  <span class="field-hint">启用 RAPTOR 递归抽象处理，用于生成段落摘要</span>
                </div>
                <div class="field">
                  <label>RAPTOR 提示词 (prompt)</label>
                  <textarea v-model="configForm.parser_config.raptor.prompt" rows="3" class="field-textarea" placeholder="RAPTOR 提示词" />
                  <span class="field-hint">用于 RAPTOR 摘要生成的提示词模板，{cluster_content} 会被替换为实际内容</span>
                </div>
                <div class="field">
                  <label>最大 token 数 (max_token)</label>
                  <input v-model.number="configForm.parser_config.raptor.max_token" type="number" min="0" max="2048" />
                  <span class="field-hint">范围 0-2048，默认 256，表示 RAPTOR 摘要的最大 token 数</span>
                </div>
                <div class="field">
                  <label>阈值 (threshold)</label>
                  <input v-model.number="configForm.parser_config.raptor.threshold" type="number" min="0" max="1" step="0.1" />
                  <span class="field-hint">范围 0.0-1.0，默认 0.1，用于控制聚类相似度阈值</span>
                </div>
                <div class="field">
                  <label>最大聚类数 (max_cluster)</label>
                  <input v-model.number="configForm.parser_config.raptor.max_cluster" type="number" min="1" max="1024" />
                  <span class="field-hint">范围 1-1024，默认 64，表示 RAPTOR 处理时的最大聚类数量</span>
                </div>
                <div class="field">
                  <label>随机种子 (random_seed)</label>
                  <input v-model.number="configForm.parser_config.raptor.random_seed" type="number" min="0" />
                  <span class="field-hint">默认 0，用于控制随机性，相同种子可复现结果</span>
                </div>
                <div class="config-section config-section-group">GraphRAG</div>
                <div class="field">
                  <label>是否启用 GraphRAG (use_graphrag)</label>
                  <select v-model="configForm.parser_config.graphrag.use_graphrag" class="field-select">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                  <span class="field-hint">启用 GraphRAG 图检索增强生成，用于构建知识图谱</span>
                </div>
                <div class="field">
                  <label>实体类型列表 (entity_types)</label>
                  <input v-model="parserConfigEntityTypesStr" type="text" placeholder="[]" class="field-monospace" />
                  <span class="field-hint">JSON 数组格式，如 ["organization", "person", "geo"]，指定要提取的实体类型</span>
                </div>
                <div class="field">
                  <label>方法类型 (method)</label>
                  <select v-model="configForm.parser_config.graphrag.method" class="field-select">
                    <option value="light">light</option>
                    <option value="general">general</option>
                  </select>
                  <span class="field-hint">light 为轻量模式，general 为通用模式，默认 light</span>
                </div>
                <div class="field">
                  <label>是否启用社区检测 (community)</label>
                  <select v-model="configForm.parser_config.graphrag.community" class="field-select">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                  <span class="field-hint">启用后会对实体进行社区检测和分组</span>
                </div>
                <div class="field">
                  <label>是否启用分辨率优化 (resolution)</label>
                  <select v-model="configForm.parser_config.graphrag.resolution" class="field-select">
                    <option :value="false">否</option>
                    <option :value="true">是</option>
                  </select>
                  <span class="field-hint">启用后会优化实体解析的精度和分辨率</span>
                </div>
              </template>
            </template>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn" @click="showConfigDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="configDetailLoading || configSaving" @click="submitConfig">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
    <div v-if="!hasVersion" class="empty-state">请先在顶部选择产品版本</div>
    <div v-else class="panels">
      <div class="panel panel-left">
        <div class="panel-header">
          <span class="panel-title">知识库管理</span>
          <div class="panel-actions">
            <button type="button" class="btn primary" @click="openAdd">新增</button>
          </div>
        </div>
        <div class="panel-body">
          <div v-if="loading" class="placeholder">加载中…</div>
          <template v-else>
            <div v-for="group in byCategory" :key="group.category" class="category-group">
              <div class="category-title">{{ group.category_display }}</div>
              <div v-if="!group.items.length" class="category-empty">暂无</div>
              <div v-else class="category-list">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="kb-item"
                  :class="{ active: selectedKbId === item.kb_id }"
                  @click="selectKb(item)"
                >
                  <div class="kb-item-main">
                    <span class="kb-item-name" :title="kbInfoMap[item.kb_id]?.name ?? item.kb_id">{{ kbInfoMap[item.kb_id]?.name ?? item.kb_id }}</span>
                    <span v-if="(kbInfoMap[item.kb_id]?.description ?? '').trim()" class="kb-item-desc" :title="kbInfoMap[item.kb_id]?.description">{{ kbInfoMap[item.kb_id].description }}</span>
                  </div>
                  <span class="kb-item-doc" :title="'当前文档数'">{{ currentDocLabel(item.kb_id) }}</span>
                  <div class="kb-item-actions" @click.stop>
                    <button type="button" class="btn-icon" title="知识库配置" @click="openConfig(item)" aria-label="配置">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    </button>
                    <button type="button" class="btn-sm" @click="openEdit(item)">编辑</button>
                    <button type="button" class="btn-sm danger" @click="handleDelete(item)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="panel panel-right">
        <div class="panel-header">
          <span class="panel-title">{{ selectedKbId ? (kbInfoMap[selectedKbId]?.name || '文档列表') : '文档管理' }}</span>
          <div v-if="selectedKbId" class="panel-actions">
            <input ref="fileInputRef" type="file" multiple class="file-input-hidden" accept="*/*" @change="onFileSelected" />
            <button type="button" class="btn primary" @click="triggerUpload">上传文档</button>
          </div>
        </div>
        <div class="panel-body panel-body-docs">
          <template v-if="!selectedKbId">
            <div class="placeholder placeholder-fill">请选择左侧知识库以查看或管理文档</div>
          </template>
          <template v-else>
            <div v-if="docsLoading" class="placeholder placeholder-fill">加载中…</div>
            <template v-else>
              <div v-if="!documentsList.length" class="placeholder placeholder-fill">暂无文档，可点击「上传文档」添加</div>
              <div v-else>
                <div class="doc-table-toolbar">
                  <button type="button" class="btn" @click="refreshDocuments" :disabled="docsLoading">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-right: 4px;">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                    刷新
                  </button>
                </div>
                <div class="doc-table-wrap">
                  <table class="doc-table">
                  <thead>
                    <tr>
                      <th class="col-name">文档名</th>
                      <th class="col-desc">文档描述</th>
                      <th class="col-size">文档大小</th>
                      <th class="col-status">文档状态</th>
                      <th class="col-slices">切片数</th>
                      <th class="col-created">创建时间</th>
                      <th class="col-actions">文档操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="doc in documentsList" :key="doc.id">
                      <td class="col-name" :title="doc.name">{{ doc.name }}</td>
                      <td class="col-desc" :title="doc.description || ''">{{ doc.description || '—' }}</td>
                      <td class="col-size">{{ formatFileSize(doc.size) }}</td>
                      <td class="col-status">{{ processStatusLabel(doc.process_status) }}</td>
                      <td class="col-slices">
                        <a v-if="doc.chunk_count > 0" href="#" class="chunk-link" @click.prevent="downloadChunks(doc)">{{ doc.chunk_count ?? 0 }}</a>
                        <span v-else>{{ doc.chunk_count ?? 0 }}</span>
                      </td>
                      <td class="col-created">{{ formatDateTime(doc.created_at || doc.created_time || doc.create_time) }}</td>
                      <td class="col-actions">
                        <button type="button" class="btn-sm" @click="openDocEdit(doc)">编辑</button>
                        <button type="button" class="btn-sm" @click="handleDownloadDoc(doc)">下载</button>
                        <button type="button" class="btn-sm" :disabled="docParsePending === doc.id" @click="handleParse(doc)">解析</button>
                        <button type="button" class="btn-sm danger" @click="handleDeleteDoc(doc)">删除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProductSelection } from '../../composables/useProductSelection.js'
import { getCategories, listVersionKbs, addKbToVersion, updateVersionKb, removeKbFromVersion } from '../../api/kbMgmt.js'
import { createKb, listKbsByTenant, updateKb, deleteKb, getKbDetail, getParserConfigTemplate, updateKbParserConfig, getEmbeddingModels, getRerankModels } from '../../api/knowledgebase.js'
import { listDocumentsByKb, uploadDocuments, updateDocument, parseDocument, deleteDocument, getDocumentChunksBatch, downloadDocument } from '../../api/document.js'

const { selectedVersionId } = useProductSelection()
const hasVersion = computed(() => !!selectedVersionId.value)

const DEFAULT_PARSER_CONFIG = {
  pages: [[1, 1000000]],
  chunk_token_num: 512,
  delimiter: '\n!?。；！？',
  task_page_size: 12,
  layout_recognize: 'DeepDOC',
  auto_keywords: 0,
  auto_questions: 0,
  html4excel: false,
  topn_tags: 3,
  tag_kb_ids: [],
  filename_embd_weight: 0.1,
  raptor: {
    use_raptor: false,
    prompt: '请总结以下段落。 小心数字，不要编造。 段落如下：\n{cluster_content}\n以上就是你需要总结的内容。',
    max_token: 256,
    threshold: 0.1,
    max_cluster: 64,
    random_seed: 0,
  },
  graphrag: {
    use_graphrag: false,
    entity_types: ['organization', 'person', 'geo', 'event', 'category'],
    method: 'light',
    community: false,
    resolution: false,
  },
}

function deepMergeParserConfig(template, fromDetail) {
  if (!template || typeof template !== 'object') template = {}
  const base = JSON.parse(JSON.stringify(DEFAULT_PARSER_CONFIG))
  Object.keys(template).forEach((k) => {
    if (template[k] !== null && template[k] !== undefined) {
      if (k === 'raptor' && typeof template.raptor === 'object') {
        base.raptor = { ...base.raptor, ...template.raptor }
      } else if (k === 'graphrag' && typeof template.graphrag === 'object') {
        base.graphrag = { ...base.graphrag, ...template.graphrag }
      } else {
        base[k] = template[k]
      }
    }
  })
  if (fromDetail && typeof fromDetail === 'object') {
    Object.keys(fromDetail).forEach((k) => {
      if (fromDetail[k] !== null && fromDetail[k] !== undefined) {
        if (k === 'raptor' && typeof fromDetail.raptor === 'object') {
          base.raptor = { ...base.raptor, ...fromDetail.raptor }
        } else if (k === 'graphrag' && typeof fromDetail.graphrag === 'object') {
          base.graphrag = { ...base.graphrag, ...fromDetail.graphrag }
        } else {
          base[k] = fromDetail[k]
        }
      }
    })
  }
  return base
}

const categories = ref([])
const versionKbData = ref({ version_id: '', by_category: [] })
const kbInfoMap = ref({})
const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editDetailLoading = ref(false)
const saving = ref(false)
const addForm = ref({ name: '', category: '', doc_num_limit: 0 })
const editForm = ref({ item: null, name: '', category: '', doc_num: 0, doc_num_limit: 0 })
const selectedKbId = ref('')
const documentsList = ref([])
const docsLoading = ref(false)
const fileInputRef = ref(null)
const docParsePending = ref('')
const showDocEditDialog = ref(false)
const docEditSaving = ref(false)
const docEditForm = ref({ doc: null, description: '' })
const showConfigDialog = ref(false)
const configKbItem = ref(null)
const configDetailLoading = ref(false)
const configSaving = ref(false)
const configTab = ref('model')
const embeddingModelsList = ref([])
const rerankModelsList = ref([])
const modelsLoading = ref(false)
const configForm = ref({
  embd_provider_name: '',
  embd_model_name: '',
  rerank_provider_name: '',
  rerank_model_name: '',
  parser_id: '',
  parser_config: JSON.parse(JSON.stringify(DEFAULT_PARSER_CONFIG)),
})

const byCategory = computed(() => versionKbData.value.by_category || [])
const configKbName = computed(() => {
  const item = configKbItem.value
  if (!item) return ''
  return kbInfoMap.value[item.kb_id]?.name ?? item.kb_id ?? ''
})

const parserConfigPagesStr = computed({
  get() {
    const p = configForm.value.parser_config?.pages
    return Array.isArray(p) ? JSON.stringify(p) : (p != null ? String(p) : '[]')
  },
  set(v) {
    try {
      const parsed = JSON.parse(v || '[]')
      if (Array.isArray(parsed)) configForm.value.parser_config.pages = parsed
    } catch {}
  },
})
const parserConfigTagKbIdsStr = computed({
  get() {
    const p = configForm.value.parser_config?.tag_kb_ids
    return Array.isArray(p) ? JSON.stringify(p) : (p != null ? String(p) : '[]')
  },
  set(v) {
    try {
      const parsed = JSON.parse(v || '[]')
      if (Array.isArray(parsed)) configForm.value.parser_config.tag_kb_ids = parsed
    } catch {}
  },
})
const parserConfigEntityTypesStr = computed({
  get() {
    const p = configForm.value.parser_config?.graphrag?.entity_types
    return Array.isArray(p) ? JSON.stringify(p) : (p != null ? String(p) : '[]')
  },
  set(v) {
    try {
      const parsed = JSON.parse(v || '[]')
      if (Array.isArray(parsed)) {
        if (!configForm.value.parser_config.graphrag) configForm.value.parser_config.graphrag = {}
        configForm.value.parser_config.graphrag.entity_types = parsed
      }
    } catch {}
  },
})

const embeddingModelOptions = computed(() => {
  const list = embeddingModelsList.value
  console.log('embeddingModelOptions computed, list:', list)
  if (!list.length) {
    console.log('embeddingModelOptions: list is empty')
    return []
  }
  const options = list.map((m) => {
    const series = m.series || ''
    const modelName = m.modelName || m.model || ''
    const display = series ? `${series}-${modelName}` : modelName
    return {
      value: display,
      display,
      provider: m.provider || '',
      model: modelName,
      series,
    }
  }).sort((a, b) => {
    if (a.series !== b.series) {
      return (a.series || '').localeCompare(b.series || '')
    }
    return (a.model || '').localeCompare(b.model || '')
  })
  console.log('embeddingModelOptions result:', options)
  return options
})

const rerankModelOptions = computed(() => {
  const list = rerankModelsList.value
  console.log('rerankModelOptions computed, list:', list)
  if (!list.length) {
    console.log('rerankModelOptions: list is empty')
    return []
  }
  const options = list.map((m) => {
    const series = m.series || ''
    const modelName = m.modelName || m.model || ''
    const display = series ? `${series}-${modelName}` : modelName
    return {
      value: display,
      display,
      provider: m.provider || '',
      model: modelName,
      series,
    }
  }).sort((a, b) => {
    if (a.series !== b.series) {
      return (a.series || '').localeCompare(b.series || '')
    }
    return (a.model || '').localeCompare(b.model || '')
  })
  console.log('rerankModelOptions result:', options)
  return options
})

const selectedEmbeddingModel = computed({
  get() {
    const m = configForm.value.embd_model_name || ''
    if (!m) return ''
    const option = embeddingModelOptions.value.find((opt) => opt.model === m)
    if (option) {
      return option.value
    }
    const p = configForm.value.embd_provider_name || ''
    return p ? `${p}-${m}` : m
  },
  set(v) {
    const option = embeddingModelOptions.value.find((opt) => opt.value === v)
    if (option) {
      configForm.value.embd_provider_name = option.provider
      configForm.value.embd_model_name = option.model
    } else {
      configForm.value.embd_provider_name = ''
      configForm.value.embd_model_name = ''
    }
  },
})

const selectedRerankModel = computed({
  get() {
    const m = configForm.value.rerank_model_name || ''
    if (!m) return ''
    const option = rerankModelOptions.value.find((opt) => opt.model === m)
    if (option) {
      return option.value
    }
    const p = configForm.value.rerank_provider_name || ''
    return p ? `${p}-${m}` : m
  },
  set(v) {
    const option = rerankModelOptions.value.find((opt) => opt.value === v)
    if (option) {
      configForm.value.rerank_provider_name = option.provider
      configForm.value.rerank_model_name = option.model
    } else {
      configForm.value.rerank_provider_name = ''
      configForm.value.rerank_model_name = ''
    }
  },
})

function currentDocLabel(kbId) {
  const info = kbInfoMap.value[kbId]
  if (!info) return ''
  const n = info.doc_num ?? 0
  const limit = info.doc_num_limit
  if (limit != null && limit > 0) return `${n} 篇 / 上限 ${limit}`
  return `${n} 篇文档`
}

async function loadCategories() {
  try {
    const list = await getCategories()
    categories.value = Array.isArray(list) ? list : []
    if (categories.value.length && !addForm.value.category) addForm.value.category = categories.value[0].value
  } catch {
    categories.value = []
  }
}

async function loadVersionKbs() {
  const versionId = selectedVersionId.value
  if (!versionId) {
    versionKbData.value = { version_id: '', by_category: [] }
    kbInfoMap.value = {}
    return
  }
  loading.value = true
  try {
    const [res, kbRes] = await Promise.all([
      listVersionKbs(versionId),
      listKbsByTenant(versionId, { items_per_page: 200 }),
    ])
    versionKbData.value = (res && Array.isArray(res.by_category)) ? res : { version_id: versionId, by_category: [] }
    const items = kbRes?.items || []
    const map = {}
    items.forEach((kb) => {
      map[kb.id] = {
        name: kb.name || kb.id,
        description: kb.description ?? '',
        doc_num: kb.doc_num ?? 0,
        doc_num_limit: kb.doc_num_limit != null ? kb.doc_num_limit : 0,
      }
    })
    kbInfoMap.value = map
  } catch {
    versionKbData.value = { version_id: selectedVersionId.value, by_category: [] }
    kbInfoMap.value = {}
  } finally {
    loading.value = false
  }
}

watch(selectedVersionId, () => {
  selectedKbId.value = ''
  loadCategories()
  loadVersionKbs()
}, { immediate: true })

watch(categories, (list) => {
  if (list.length && !addForm.value.category) addForm.value.category = list[0].value
}, { immediate: true })

watch(selectedKbId, (kbId) => {
  if (kbId) loadDocuments(kbId)
  else documentsList.value = []
})

function selectKb(item) {
  selectedKbId.value = item.kb_id
}

async function loadDocuments(kbId) {
  if (!kbId) return
  docsLoading.value = true
  try {
    const res = await listDocumentsByKb(kbId, { page_size: 100 })
    documentsList.value = res?.documents ?? []
  } catch {
    documentsList.value = []
  } finally {
    docsLoading.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes == null || bytes === 0) return '—'
  const n = Number(bytes)
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function formatDateTime(dateTime) {
  if (!dateTime) return '—'
  try {
    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return '—'
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  } catch {
    return '—'
  }
}

function processStatusLabel(status) {
  const map = {
    init: '待解析',
    chunking: '切片中',
    raptoring: '处理中',
    graphing: '处理中',
    parsed: '已解析',
    failed: '解析失败',
  }
  return map[status] ?? status ?? '未知'
}

function triggerUpload() {
  fileInputRef.value?.click()
}

async function onFileSelected(ev) {
  const files = ev.target.files
  if (!files?.length || !selectedKbId.value) return
  const kbId = selectedKbId.value
  try {
    await uploadDocuments(kbId, Array.from(files))
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '上传失败'))
  } finally {
    await loadDocuments(kbId)
    await loadVersionKbs()
  }
  ev.target.value = ''
}

async function handleParse(doc) {
  docParsePending.value = doc.id
  try {
    await parseDocument(doc.id)
    await loadDocuments(selectedKbId.value)
    await loadVersionKbs()
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '解析失败'))
  } finally {
    docParsePending.value = ''
  }
}

async function refreshDocuments() {
  if (!selectedKbId.value) return
  await loadDocuments(selectedKbId.value)
  await loadVersionKbs()
}

function openDocEdit(doc) {
  docEditForm.value = { doc, description: doc.description ?? '' }
  showDocEditDialog.value = true
}

async function submitDocEdit() {
  const { doc, description } = docEditForm.value
  if (!doc?.id) return
  docEditSaving.value = true
  try {
    await updateDocument(doc.id, { description: description ?? '' })
    showDocEditDialog.value = false
    await loadDocuments(selectedKbId.value)
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '保存失败'))
  } finally {
    docEditSaving.value = false
  }
}

async function handleDownloadDoc(doc) {
  if (!doc.id) return
  try {
    const blob = await downloadDocument(doc.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = doc.name || `document_${doc.id}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '下载失败'))
  }
}

async function handleDeleteDoc(doc) {
  if (!confirm(`确定删除文档「${doc.name}」？`)) return
  try {
    await deleteDocument(doc.id)
    await loadDocuments(selectedKbId.value)
    await loadVersionKbs()
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '删除失败'))
  }
}

async function downloadChunks(doc) {
  if (!doc.id || !doc.chunk_count || doc.chunk_count === 0) return
  try {
    const allChunks = []
    const pageSize = 100
    let page = 1
    let hasMore = true
    
    while (hasMore) {
      const res = await getDocumentChunksBatch([doc.id], {
        with_vector: false,
        page,
        page_size: pageSize,
      })
      const chunks = res?.chunks || res?.items || []
      if (chunks.length > 0) {
        allChunks.push(...chunks)
        if (chunks.length < pageSize) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }
    }
    
    if (!allChunks.length) {
      alert('暂无切片数据')
      return
    }
    
    const dataStr = JSON.stringify(allChunks, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = `${(doc.name || doc.id).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_chunks.json`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '下载失败'))
  }
}

function openAdd() {
  addForm.value = { name: '', category: categories.value[0]?.value || '', doc_num_limit: 0 }
  showAddDialog.value = true
}

async function submitAdd() {
  const versionId = selectedVersionId.value
  const name = addForm.value.name?.trim()
  const category = addForm.value.category
  if (!versionId || !name || !category) return
  const docNumLimit = addForm.value.doc_num_limit != null && addForm.value.doc_num_limit >= 0 ? addForm.value.doc_num_limit : 0
  saving.value = true
  try {
    const createRes = await createKb({
      name,
      tenant_id: versionId,
      doc_num_limit: docNumLimit,
      parser_id: 'general',
      parser_config: JSON.parse(JSON.stringify(DEFAULT_PARSER_CONFIG)),
    })
    const kbId = createRes?.kb_id
    if (!kbId) throw new Error('创建知识库未返回 ID')
    await addKbToVersion(versionId, { kb_id: kbId, category })
    showAddDialog.value = false
    await loadVersionKbs()
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '操作失败'))
  } finally {
    saving.value = false
  }
}

function normalizeModelList(models) {
  console.log('normalizeModelList input:', models)
  if (!models) {
    console.log('normalizeModelList: models is null/undefined')
    return []
  }
  if (!Array.isArray(models)) {
    console.log('normalizeModelList: models is not an array, type:', typeof models)
    return []
  }
  if (models.length === 0) {
    console.log('normalizeModelList: models array is empty')
    return []
  }
  const result = models.map((m) => {
    if (typeof m === 'string') {
      const parts = m.split('/')
      if (parts.length >= 2) {
        return { provider: parts[0], model: parts.slice(1).join('/'), series: '', modelName: parts.slice(1).join('/') }
      }
      return { provider: '', model: m, series: '', modelName: m }
    }
    if (m && typeof m === 'object') {
      const series = m.series ?? m.series_name ?? m.model_series ?? m.seriesName ?? ''
      const modelName = m.model ?? m.model_name ?? m.name ?? ''
      const provider = m.provider ?? m.provider_name ?? ''
      const resultItem = {
        provider,
        model: modelName,
        series,
        modelName,
      }
      console.log('normalizeModelList item:', m, '->', resultItem)
      return resultItem
    }
    return { provider: '', model: String(m), series: '', modelName: String(m) }
  })
  console.log('normalizeModelList output:', result)
  return result
}

async function openConfig(item) {
  configKbItem.value = item
  configForm.value = {
    embd_provider_name: '',
    embd_model_name: '',
    rerank_provider_name: '',
    rerank_model_name: '',
    parser_id: '',
    parser_config: JSON.parse(JSON.stringify(DEFAULT_PARSER_CONFIG)),
  }
  configTab.value = 'model'
  showConfigDialog.value = true
  configDetailLoading.value = true
  modelsLoading.value = true
  try {
    const [detail, templateRes, embdModelsRes, rerankModelsRes] = await Promise.all([
      getKbDetail(item.kb_id),
      getParserConfigTemplate().catch(() => null),
      getEmbeddingModels().catch((e) => {
        console.error('Failed to load embedding models:', e)
        return []
      }),
      getRerankModels().catch((e) => {
        console.error('Failed to load rerank models:', e)
        return []
      }),
    ])
    console.log('Embedding models response:', embdModelsRes)
    console.log('Rerank models response:', rerankModelsRes)
    let embdList = []
    if (Array.isArray(embdModelsRes)) {
      embdList = embdModelsRes
    } else if (embdModelsRes && typeof embdModelsRes === 'object') {
      if (embdModelsRes.models) {
        embdList = Array.isArray(embdModelsRes.models) ? embdModelsRes.models : []
      } else if (embdModelsRes.items) {
        embdList = Array.isArray(embdModelsRes.items) ? embdModelsRes.items : []
      } else if (embdModelsRes.data) {
        embdList = Array.isArray(embdModelsRes.data) ? embdModelsRes.data : []
      } else {
        const keys = Object.keys(embdModelsRes)
        if (keys.length > 0) {
          embdList = Object.values(embdModelsRes).flat().filter(Boolean)
        }
      }
    }
    
    let rerankList = []
    if (Array.isArray(rerankModelsRes)) {
      rerankList = rerankModelsRes
    } else if (rerankModelsRes && typeof rerankModelsRes === 'object') {
      if (rerankModelsRes.models) {
        rerankList = Array.isArray(rerankModelsRes.models) ? rerankModelsRes.models : []
      } else if (rerankModelsRes.items) {
        rerankList = Array.isArray(rerankModelsRes.items) ? rerankModelsRes.items : []
      } else if (rerankModelsRes.data) {
        rerankList = Array.isArray(rerankModelsRes.data) ? rerankModelsRes.data : []
      } else {
        const keys = Object.keys(rerankModelsRes)
        if (keys.length > 0) {
          rerankList = Object.values(rerankModelsRes).flat().filter(Boolean)
        }
      }
    }
    console.log('Normalized embedding list:', embdList)
    console.log('Normalized rerank list:', rerankList)
    embeddingModelsList.value = normalizeModelList(embdList)
    rerankModelsList.value = normalizeModelList(rerankList)
    console.log('Final embeddingModelsList:', embeddingModelsList.value)
    console.log('Final rerankModelsList:', rerankModelsList.value)
    const template = templateRes?.template ?? DEFAULT_PARSER_CONFIG
    configForm.value = {
      embd_provider_name: detail?.embd_provider_name ?? '',
      embd_model_name: detail?.embd_model_name ?? '',
      rerank_provider_name: detail?.rerank_provider_name ?? '',
      rerank_model_name: detail?.rerank_model_name ?? '',
      parser_id: detail?.parser_id ?? '',
      parser_config: deepMergeParserConfig(template, detail?.parser_config),
    }
  } catch {
    // 忽略错误，使用默认值
  } finally {
    configDetailLoading.value = false
    modelsLoading.value = false
  }
}

async function submitConfig() {
  const item = configKbItem.value
  if (!item?.kb_id) return
  const form = configForm.value
  configSaving.value = true
  try {
    const modelPayload = {
      embd_provider_name: form.embd_provider_name || undefined,
      embd_model_name: form.embd_model_name || undefined,
      rerank_provider_name: form.rerank_provider_name || undefined,
      rerank_model_name: form.rerank_model_name || undefined,
    }
    await updateKb(item.kb_id, modelPayload)
    const parserPayload = {
      parser_id: form.parser_id || undefined,
      parser_config: form.parser_config || undefined,
    }
    await updateKbParserConfig(item.kb_id, parserPayload)
    showConfigDialog.value = false
  } catch (e) {
    const d = e?.data?.detail
    alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '保存失败'))
  } finally {
    configSaving.value = false
  }
}

async function openEdit(item) {
  const info = kbInfoMap.value[item.kb_id]
  editForm.value = {
    item,
    name: info?.name ?? item.kb_id ?? '',
    category: item.category,
    doc_num: info?.doc_num ?? 0,
    doc_num_limit: info?.doc_num_limit ?? 0,
  }
  showEditDialog.value = true
  editDetailLoading.value = true
  try {
    const detail = await getKbDetail(item.kb_id)
    editForm.value = {
      ...editForm.value,
      name: detail?.name ?? editForm.value.name,
      doc_num: detail?.doc_num ?? 0,
      doc_num_limit: detail?.doc_num_limit != null ? detail.doc_num_limit : 0,
    }
    if (kbInfoMap.value[item.kb_id]) {
      kbInfoMap.value[item.kb_id].doc_num = detail?.doc_num ?? 0
      kbInfoMap.value[item.kb_id].doc_num_limit = detail?.doc_num_limit ?? 0
    }
  } catch {
    editForm.value = { ...editForm.value, doc_num: info?.doc_num ?? 0, doc_num_limit: info?.doc_num_limit ?? 0 }
  } finally {
    editDetailLoading.value = false
  }
}

async function submitEdit() {
  const versionId = selectedVersionId.value
  const { item, name, description, category, doc_num_limit } = editForm.value
  const nameTrim = name?.trim()
  if (!versionId || !item?.id || !category || !nameTrim) return
  saving.value = true
  try {
    const payload = { name: nameTrim }
    if (description !== undefined) payload.description = description ?? ''
    if (doc_num_limit != null && doc_num_limit >= 0) payload.doc_num_limit = doc_num_limit
    await updateKb(item.kb_id, payload)
    await updateVersionKb(versionId, item.id, { category })
    if (kbInfoMap.value[item.kb_id]) kbInfoMap.value[item.kb_id].description = description ?? ''
    showEditDialog.value = false
    await loadVersionKbs()
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '操作失败'))
  } finally {
    saving.value = false
  }
}

async function handleDelete(item) {
  const displayName = kbInfoMap.value[item.kb_id]?.name || item.kb_id
  if (!confirm(`确定删除知识库「${displayName}」？将同时删除知识库及其与当前版本的关系，且不可恢复。`)) return
  const versionId = selectedVersionId.value
  if (!versionId || !item?.id) return
  if (selectedKbId.value === item.kb_id) selectedKbId.value = ''
  try {
    await removeKbFromVersion(versionId, item.id)
    try {
      await deleteKb(item.kb_id)
    } catch (_) {}
  } catch (e) {
    const d = e?.data?.detail; alert((typeof d === 'object' && d?.message) ? d.message : (d || e?.message || '操作失败'))
  } finally {
    await loadVersionKbs()
  }
}
</script>

<style scoped>
.knowledge-manage-tab {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.empty-state {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  color: #9aa0a6;
  font-size: 14px;
}
.panels {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 12px;
  overflow: hidden;
}
.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.panel-left {
  flex: 0 0 33.333%;
  min-width: 0;
}
.panel-right {
  flex: 1;
  min-width: 0;
}
.panel-header {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
}
.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: #5f6368;
}
.panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.panel-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
.panel-body-docs {
  display: flex;
  flex-direction: column;
}
.panel-body-docs .placeholder-fill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}
.placeholder {
  padding: 16px;
  font-size: 14px;
  color: #9aa0a6;
  text-align: center;
}
.category-group {
  margin-bottom: 16px;
}
.category-title {
  font-size: 14px;
  font-weight: 400;
  color: #202124;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e8eaed;
}
.category-empty {
  font-size: 13px;
  color: #9aa0a6;
  padding: 4px 0;
}
.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kb-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
}
.kb-item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.kb-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kb-item-desc {
  font-size: 12px;
  color: #9aa0a6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.kb-item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  color: #5f6368;
}
.btn-icon:hover { background: #e8eaed; color: #202124; }
.btn-icon:focus { outline: none; box-shadow: none; }
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: #5f6368;
  color: #fff;
}
.btn-sm:hover { background: #80868b; }
.btn-sm.danger { background: #ea4335; }
.btn-sm.danger:hover { background: #d33b2c; }
.btn { padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; background: #5f6368; color: #fff; }
.btn:hover:not(:disabled) { background: #80868b; }
.btn.primary { background: #5f6368; color: #fff; }
.btn.primary:hover:not(:disabled) { background: #80868b; }
.btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.dialog {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  min-width: 320px;
  max-width: 90vw;
}
.dialog-edit-kb {
  min-width: 480px;
  max-width: 520px;
}
.dialog-config {
  min-width: 520px;
  max-width: 600px;
}
.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8eaed;
}
.dialog-title { font-size: 16px; font-weight: 500; color: #202124; }
.dialog-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 20px;
  color: #5f6368;
  border-radius: 4px;
}
.dialog-close:hover { background: #f1f3f4; color: #202124; }
.dialog-body { padding: 16px; }
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #e8eaed;
}
.field { margin-bottom: 16px; }
.field:last-child { margin-bottom: 0; }
.field label { display: block; margin-bottom: 6px; font-size: 14px; color: #202124; }
.field input, .field-select, .field-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.field-textarea { resize: vertical; min-height: 60px; }
.field-select { cursor: pointer; }
.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #9aa0a6;
}
.field-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.field-checkbox input[type="checkbox"] {
  width: auto;
  margin: 0;
}
.field-readonly {
  padding: 8px 12px;
  font-size: 14px;
  color: #5f6368;
  background: #f1f3f4;
  border-radius: 6px;
}
.edit-loading {
  padding: 24px;
  font-size: 14px;
  color: #9aa0a6;
  text-align: center;
}
.dialog-config .dialog-body { max-height: 70vh; overflow-y: auto; }
.config-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
  background: #f8fafc;
}
.config-tab {
  padding: 10px 16px;
  font-size: 14px;
  color: #5f6368;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  margin-bottom: -1px;
}
.config-tab:hover { color: #202124; }
.config-tab.active {
  color: #1a73e8;
  font-weight: 500;
  border-bottom-color: #1a73e8;
}
.config-section {
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #202124;
}
.config-section:first-of-type { margin-top: 0; }
.config-section-group {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #dadce0;
}
.config-section-group:first-of-type { margin-top: 0; padding-top: 0; border-top: none; }
.field-monospace { font-family: ui-monospace, monospace; font-size: 13px; }
.kb-item-main .kb-item-name { min-width: 0; }
.kb-item-doc {
  flex-shrink: 0;
  font-size: 12px;
  color: #9aa0a6;
}
.kb-item.active { background: #e8f0fe; }
.kb-item { cursor: pointer; }
.file-input-hidden { position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none; }
.doc-table-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  padding: 0 4px;
}
.doc-table-toolbar .btn {
  display: inline-flex;
  align-items: center;
}
.doc-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #dadce0;
}
.doc-table th,
.doc-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #dadce0;
  border-right: 1px solid #dadce0;
  text-align: left;
  vertical-align: middle;
}
.doc-table th:last-child,
.doc-table td:last-child {
  border-right: none;
}
.doc-table tbody tr:last-child td {
  border-bottom: none;
}
.doc-table th {
  background: #f1f3f4;
  color: #202124;
  font-weight: 500;
}
.doc-table tbody tr:nth-child(even) { background: #f8fafc; }
.doc-table tbody tr:hover { background: #e8f0fe; }
.doc-table .col-name { min-width: 70px; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-table .col-desc { min-width: 150px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #5f6368; }
.doc-table .col-size { width: 100px; color: #5f6368; }
.doc-table .col-status { width: 90px; color: #5f6368; }
.doc-table .col-slices { width: 70px; color: #5f6368; }
.doc-table .col-slices .chunk-link {
  color: #1a73e8;
  text-decoration: none;
  cursor: pointer;
}
.doc-table .col-slices .chunk-link:hover {
  text-decoration: underline;
}
.doc-table .col-created { width: 160px; color: #5f6368; white-space: nowrap; }
.doc-table .col-actions { width: 200px; white-space: nowrap; }
.doc-table .col-actions .btn-sm { margin-right: 4px; }
.doc-table .col-actions .btn-sm:last-child { margin-right: 0; }
</style>
