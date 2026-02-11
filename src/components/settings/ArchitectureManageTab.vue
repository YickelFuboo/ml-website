<template>
  <div class="architecture-manage-tab">
    <Teleport to="body">
      <div v-if="showCreateInterfaceDialog" class="add-relation-dialog-mask" @click.self="showCreateInterfaceDialog = false">
        <div class="add-relation-dialog create-interface-dialog">
          <div class="add-relation-title">新增接口（并作为本元素提供的接口）</div>
          <div class="field">
            <label>接口类别</label>
            <select v-model="createInterfaceForm.interface_category" class="add-relation-select" required>
              <option v-for="c in interfaceCategories" :key="c" :value="c">{{ getInterfaceCategoryLabel(c) }}</option>
            </select>
          </div>
          <div class="field">
            <label>父接口（选填）</label>
            <select v-model="createInterfaceForm.parent_id" class="add-relation-select">
              <option value="">无</option>
              <option v-for="iface in versionInterfacesList" :key="iface.id" :value="iface.id">{{ iface.name || iface.code || iface.id }}</option>
            </select>
          </div>
          <div class="field">
            <label>接口名称</label>
            <input v-model="createInterfaceForm.name" type="text" placeholder="必填" />
          </div>
          <div class="field">
            <label>编码/代号</label>
            <input v-model="createInterfaceForm.code" type="text" placeholder="选填" />
          </div>
          <div class="field">
            <label>说明</label>
            <textarea v-model="createInterfaceForm.description" rows="2" placeholder="选填" />
          </div>
          <div class="field">
            <label>功能级定义（MD）</label>
            <textarea v-model="createInterfaceForm.definition" rows="3" placeholder="选填" />
          </div>
          <div class="field">
            <label>规格（MD）</label>
            <textarea v-model="createInterfaceForm.specification" rows="2" placeholder="选填" />
          </div>
          <div class="field">
            <label>约束（MD）</label>
            <textarea v-model="createInterfaceForm.constraints" rows="2" placeholder="选填" />
          </div>
          <div class="field">
            <label>物理接口类型（选填）</label>
            <select v-model="createInterfaceForm.interface_type" class="add-relation-select">
              <option value="">无</option>
              <option v-for="t in physicalInterfaceTypes" :key="t" :value="t">{{ getInterfaceTypeLabel(t) }}</option>
            </select>
          </div>
          <div class="field">
            <label>技术栈（选填）</label>
            <input v-model="createInterfaceForm.tech_stack" type="text" placeholder="选填" />
          </div>
          <div class="add-relation-actions">
            <button type="button" class="btn" @click="showCreateInterfaceDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="!canSubmitCreateInterface" @click="submitCreateInterface">确定</button>
          </div>
        </div>
      </div>
      <div v-if="showAddRelationDialog" class="add-relation-dialog-mask" @click.self="showAddRelationDialog = false">
        <div class="add-relation-dialog">
          <div class="add-relation-title">添加依赖的接口（选择现有接口）</div>
          <div class="field">
            <label>选择接口</label>
            <select v-model="addRelationInterfaceId" class="add-relation-select">
              <option value="">请选择</option>
              <option v-for="iface in addRelationInterfaceOptions" :key="iface.id" :value="iface.id">{{ iface.name || iface.code || iface.id }}</option>
            </select>
          </div>
          <div class="field">
            <label>关系说明（选填）</label>
            <textarea v-model="addRelationDescription" rows="2" placeholder="选填" />
          </div>
          <div class="add-relation-actions">
            <button type="button" class="btn" @click="showAddRelationDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="!addRelationInterfaceId" @click="submitAddRelation">确定</button>
          </div>
        </div>
      </div>
      <div v-if="showAddElementToArtifactDialog" class="add-relation-dialog-mask" @click.self="showAddElementToArtifactDialog = false">
        <div class="add-relation-dialog">
          <div class="add-relation-title">添加构建产物映射</div>
          <div v-if="currentView === 'impl'" class="field">
            <label>选择架构元素</label>
            <select v-model="addElementToArtifactForm.element_id" class="add-relation-select">
              <option value="">请选择</option>
              <option v-for="item in flatNodes" :key="item.node.id" :value="item.node.id">{{ item.depth ? '　'.repeat(item.depth) + '└ ' : '' }}{{ item.node.name || '未命名节点' }} ({{ getTypeLabel(item.node.type) }})</option>
            </select>
          </div>
          <div v-else class="field">
            <label>选择构建产物</label>
            <select v-model="addElementToArtifactForm.build_artifact_id" class="add-relation-select">
              <option value="">请选择</option>
              <option v-for="artifact in buildArtifactsList" :key="artifact.id" :value="artifact.id">{{ artifact.name }} ({{ getArtifactTypeLabel(artifact.artifact_type) }})</option>
            </select>
          </div>
          <div class="field">
            <label>构建顺序</label>
            <input v-model.number="addElementToArtifactForm.build_order" type="number" min="0" placeholder="0" />
          </div>
          <div class="field">
            <label>说明（选填）</label>
            <textarea v-model="addElementToArtifactForm.description" rows="2" placeholder="选填" />
          </div>
          <div class="add-relation-actions">
            <button type="button" class="btn" @click="showAddElementToArtifactDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="currentView === 'impl' ? !addElementToArtifactForm.element_id : !addElementToArtifactForm.build_artifact_id" @click="submitAddElementToArtifact">确定</button>
          </div>
        </div>
      </div>
      <div v-if="showAddArtifactToArtifactDialog" class="add-relation-dialog-mask" @click.self="showAddArtifactToArtifactDialog = false">
        <div class="add-relation-dialog">
          <div class="add-relation-title">添加构建产物关系</div>
          <div class="field">
            <label>输入构建产物</label>
            <select v-model="addArtifactToArtifactForm.input_artifact_id" class="add-relation-select">
              <option value="">请选择</option>
              <option v-for="artifact in buildArtifactsList" :key="artifact.id" :value="artifact.id">{{ artifact.name }} ({{ getArtifactTypeLabel(artifact.artifact_type) }})</option>
            </select>
          </div>
          <div class="field">
            <label>目标构建产物</label>
            <select v-model="addArtifactToArtifactForm.target_artifact_id" class="add-relation-select">
              <option value="">请选择</option>
              <option v-for="artifact in buildArtifactsList" :key="artifact.id" :value="artifact.id">{{ artifact.name }} ({{ getArtifactTypeLabel(artifact.artifact_type) }})</option>
            </select>
          </div>
          <div class="field">
            <label>构建顺序</label>
            <input v-model.number="addArtifactToArtifactForm.build_order" type="number" min="0" placeholder="0" />
          </div>
          <div class="field">
            <label>说明（选填）</label>
            <textarea v-model="addArtifactToArtifactForm.description" rows="2" placeholder="选填" />
          </div>
          <div class="add-relation-actions">
            <button type="button" class="btn" @click="showAddArtifactToArtifactDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="!addArtifactToArtifactForm.input_artifact_id || !addArtifactToArtifactForm.target_artifact_id" @click="submitAddArtifactToArtifact">确定</button>
          </div>
        </div>
      </div>
      <div v-if="showAddArtifactToDeploymentDialog" class="add-relation-dialog-mask" @click.self="showAddArtifactToDeploymentDialog = false">
        <div class="add-relation-dialog">
          <div class="add-relation-title">添加构建产物映射</div>
          <div class="field">
            <label>选择构建产物</label>
            <select v-model="addArtifactToDeploymentForm.build_artifact_id" class="add-relation-select">
              <option value="">请选择</option>
              <option v-for="artifact in buildArtifactsList" :key="artifact.id" :value="artifact.id">{{ artifact.name }} ({{ getArtifactTypeLabel(artifact.artifact_type) }})</option>
            </select>
          </div>
          <div class="field field-md">
            <div class="field-md-header">
              <label>部署配置（MD，选填）</label>
              <button type="button" class="btn-md-toggle" @click="toggleAddArtifactToDeploymentMdPreview('deployment_config')">{{ addArtifactToDeploymentMdShowPreview.deployment_config ? '源码' : '效果' }}</button>
            </div>
            <textarea v-if="!addArtifactToDeploymentMdShowPreview.deployment_config" v-model="addArtifactToDeploymentForm.deployment_config" class="textarea-md-field" rows="3" placeholder="部署配置（JSON，覆盖部署单元的默认配置），支持 Markdown" />
            <div v-else class="md-preview" v-html="renderMd(addArtifactToDeploymentForm.deployment_config)" />
          </div>
          <div class="field">
            <label>说明（选填）</label>
            <textarea v-model="addArtifactToDeploymentForm.description" rows="2" placeholder="选填" />
          </div>
          <div class="add-relation-actions">
            <button type="button" class="btn" @click="showAddArtifactToDeploymentDialog = false">取消</button>
            <button type="button" class="btn primary" :disabled="!addArtifactToDeploymentForm.build_artifact_id" @click="submitAddArtifactToDeployment">确定</button>
          </div>
        </div>
      </div>
    </Teleport>
    <div v-if="!hasVersion" class="empty-state">
      请先在顶部选择一个产品版本，再进行架构管理。
    </div>

    <div v-else class="panels">
      <div class="panel panel-left">
        <div class="panel-header">
          <div class="panel-header-left">
            <span class="panel-title">{{ currentView === 'impl' ? '构建产物树' : currentView === 'deploy' ? '部署单元树' : '架构元素树' }}</span>
            <div class="view-select-wrap" ref="viewSelectRef">
              <button
                type="button"
                class="view-select-btn"
                aria-haspopup="listbox"
                :aria-expanded="viewSelectOpen"
                @click="viewSelectOpen = !viewSelectOpen"
              >
                {{ currentViewLabel }}
                <svg class="view-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div v-if="viewSelectOpen" class="view-select-dropdown" role="listbox">
                <button
                  v-for="v in views"
                  :key="v.id"
                  type="button"
                  class="view-select-option"
                  :class="{ active: currentView === v.id }"
                  role="option"
                  @click.stop="handleViewChange(v.id)"
                >
                  {{ v.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="panel-actions">
            <button type="button" class="btn primary" @click="handleAdd">新增</button>
            <button type="button" class="btn danger" :disabled="currentView === 'impl' ? !selectedArtifactId : currentView === 'deploy' ? !selectedDeploymentUnitId : !selectedNodeId" @click="handleDeleteNode">删除</button>
          </div>
        </div>
        <div class="panel-body tree">
          <div v-if="currentView === 'impl'">
            <div v-if="buildArtifactsTreeLoading" class="placeholder">加载中…</div>
            <div v-else-if="!buildArtifactsTreeFlat.length" class="placeholder">暂无构建产物，请点击「新增」</div>
            <button
              v-for="item in buildArtifactsTreeFlat"
              :key="item.artifact.id"
              type="button"
              class="tree-node"
              :class="{ active: selectedArtifactId === item.artifact.id }"
              :style="{ paddingLeft: `${12 + item.depth * 16}px` }"
              @click="selectedArtifactId = item.artifact.id"
            >
              <span class="node-icon">📦</span>
              <span class="node-name">{{ formatTreeNodeName(getArtifactTypeLabel(item.artifact.artifact_type), item.artifact.name || '未命名产物') }}</span>
            </button>
          </div>
          <div v-else-if="currentView === 'deploy'">
            <div v-if="deploymentUnitsTreeLoading" class="placeholder">加载中…</div>
            <div v-else-if="!deploymentUnitsTreeFlat.length" class="placeholder">暂无部署单元，请点击「新增」</div>
            <button
              v-for="item in deploymentUnitsTreeFlat"
              :key="item.unit.id"
              type="button"
              class="tree-node"
              :class="{ active: selectedDeploymentUnitId === item.unit.id }"
              :style="{ paddingLeft: `${12 + item.depth * 16}px` }"
              @click="selectedDeploymentUnitId = item.unit.id"
            >
              <span class="node-icon">🚀</span>
              <span class="node-name">{{ formatTreeNodeName(getDeploymentUnitTypeLabel(item.unit.unit_type), item.unit.name || '未命名单元') }}</span>
            </button>
          </div>
          <div v-else>
            <div v-if="loading" class="placeholder">加载中…</div>
            <div v-else-if="flatNodes.length === 0" class="placeholder">暂无节点，请点击「新增」</div>
            <button
              v-for="item in flatNodes"
              :key="item.node.id"
              type="button"
              class="tree-node"
              :class="{ active: selectedNodeId === item.node.id }"
              :style="{ paddingLeft: `${12 + item.depth * 16}px` }"
              @click="selectedNodeId = item.node.id"
            >
              <span class="node-icon">{{ getTypeIcon(item.node.type) }}</span>
              <span class="node-name">{{ formatTreeNodeName(getTypeLabel(item.node.type), item.node.name || '未命名节点') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="panel panel-center">
        <div class="panel-header">
          <span class="panel-title">节点详情</span>
        </div>
        <div class="panel-body">
          <div v-if="currentView === 'impl'">
            <div v-if="!selectedArtifact && selectedArtifactId" class="placeholder">请选择左侧树中的构建产物</div>
            <template v-else>
              <div class="detail-tabs">
                <button type="button" class="detail-tab" :class="{ active: detailTab === 'basic' }" @click="detailTab = 'basic'">基本信息</button>
                <button type="button" class="detail-tab" :class="{ active: detailTab === 'build' }" @click="detailTab = 'build'">构建关系</button>
              </div>
              <div v-show="detailTab === 'basic'" class="detail-form">
                <div class="field">
                  <label>名称</label>
                  <input v-model="artifactDraft.name" type="text" placeholder="构建产物名称" />
                </div>
                <div class="field">
                  <label>产物类型</label>
                  <select v-model="artifactDraft.artifact_type">
                    <option value="">请选择</option>
                    <option v-for="type in buildArtifactTypes" :key="type" :value="type">{{ getArtifactTypeLabel(type) }}</option>
                  </select>
                </div>
                <div class="field field-md">
                  <div class="field-md-header">
                    <label>构建命令（MD）</label>
                    <button type="button" class="btn-md-toggle" @click="toggleArtifactMdPreview('build_command')">{{ artifactMdShowPreview.build_command ? '源码' : '效果' }}</button>
                  </div>
                  <textarea v-if="!artifactMdShowPreview.build_command" v-model="artifactDraft.build_command" class="textarea-md-field" rows="3" placeholder="构建命令，支持 Markdown" />
                  <div v-else class="md-preview" v-html="renderMd(artifactDraft.build_command)" />
                </div>
                <div class="field field-md">
                  <div class="field-md-header">
                    <label>构建环境（MD）</label>
                    <button type="button" class="btn-md-toggle" @click="toggleArtifactMdPreview('build_environment')">{{ artifactMdShowPreview.build_environment ? '源码' : '效果' }}</button>
                  </div>
                  <textarea v-if="!artifactMdShowPreview.build_environment" v-model="artifactDraft.build_environment" class="textarea-md-field" rows="3" placeholder="构建环境信息（OS、编译器版本、运行时版本等），支持 Markdown" />
                  <div v-else class="md-preview" v-html="renderMd(artifactDraft.build_environment)" />
                </div>
                <div class="field field-md">
                  <div class="field-md-header">
                    <label>说明（MD）</label>
                    <button type="button" class="btn-md-toggle" @click="toggleArtifactMdPreview('description')">{{ artifactMdShowPreview.description ? '源码' : '效果' }}</button>
                  </div>
                  <textarea v-if="!artifactMdShowPreview.description" v-model="artifactDraft.description" class="textarea-md-field" rows="3" placeholder="说明，支持 Markdown" />
                  <div v-else class="md-preview" v-html="renderMd(artifactDraft.description)" />
                </div>
                <div class="field">
                  <button type="button" class="btn primary" @click="handleSaveArtifact">保存</button>
                </div>
              </div>
              <div v-show="detailTab === 'build' && currentView === 'impl'" class="detail-form build-relations">
                <div v-if="buildRelationsLoading" class="interface-loading">加载中…</div>
                <template v-else>
                  <div class="build-section">
                    <div class="interface-section-head">
                      <span class="interface-section-title">{{ currentView === 'impl' ? '映射的架构元素' : '映射的构建产物' }}</span>
                      <button type="button" class="btn btn-sm" @click.stop="openAddElementToArtifactDialog">添加</button>
                    </div>
                    <div v-if="!elementToArtifactsList.length" class="interface-empty">暂无数据</div>
                    <ul v-else class="interface-list">
                      <li v-for="item in elementToArtifactsList" :key="item.id" class="interface-item">
                        <div class="interface-item-summary">
                          <template v-if="currentView === 'impl'">
                            <span class="interface-name">{{ getElementName(item.element_id) }}</span>
                            <span v-if="getElementType(item.element_id)" class="interface-meta">{{ getTypeLabel(getElementType(item.element_id)) }}</span>
                          </template>
                          <template v-else>
                            <span class="interface-name">{{ item.artifact?.name || '—' }}</span>
                            <span v-if="item.artifact?.artifact_type" class="interface-meta">{{ getArtifactTypeLabel(item.artifact.artifact_type) }}</span>
                          </template>
                          <span v-if="item.build_order !== undefined && item.build_order !== null" class="interface-meta">顺序: {{ item.build_order }}</span>
                          <span v-if="item.description" class="interface-rel-desc">{{ item.description }}</span>
                          <button type="button" class="btn-remove" aria-label="删除" @click="removeElementToArtifact(item.id)">删除</button>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div class="build-section">
                    <div class="interface-section-head">
                      <span class="interface-section-title">构建产物关系</span>
                      <button type="button" class="btn btn-sm" @click.stop="openAddArtifactToArtifactDialog">添加</button>
                    </div>
                    <div v-if="!artifactRelationsList.length" class="interface-empty">暂无数据</div>
                    <ul v-else class="interface-list">
                      <li v-for="item in artifactRelationsList" :key="item.id" class="interface-item">
                        <div class="interface-item-summary">
                          <span class="interface-name">{{ getArtifactName(item.input_artifact_id) }}</span>
                          <span class="interface-meta">→</span>
                          <span class="interface-name">{{ getArtifactName(item.target_artifact_id) }}</span>
                          <span v-if="item.build_order !== undefined && item.build_order !== null" class="interface-meta">顺序: {{ item.build_order }}</span>
                          <span v-if="item.description" class="interface-rel-desc">{{ item.description }}</span>
                          <button type="button" class="btn-remove" aria-label="删除" @click="removeArtifactToArtifact(item.id)">删除</button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <div v-else-if="currentView === 'deploy'">
            <div v-if="!selectedDeploymentUnit && selectedDeploymentUnitId" class="placeholder">请选择左侧树中的部署单元</div>
            <template v-else>
              <div class="detail-tabs">
                <button type="button" class="detail-tab" :class="{ active: detailTab === 'basic' }" @click="detailTab = 'basic'">基本信息</button>
                <button type="button" class="detail-tab" :class="{ active: detailTab === 'deployment' }" @click="detailTab = 'deployment'">部署关系</button>
              </div>
              <div v-show="detailTab === 'basic'" class="detail-form">
                <div class="field">
                  <label>名称</label>
                  <input v-model="deploymentUnitDraft.name" type="text" placeholder="部署单元名称" />
                </div>
                <div class="field">
                  <label>父单元</label>
                  <select v-model="deploymentUnitDraft.parent_unit_id" class="parent-select">
                    <option value="">根（无父单元）</option>
                    <option
                      v-for="item in deploymentUnitParentOptions"
                      :key="item.unit.id"
                      :value="item.unit.id"
                    >
                      {{ item.depth ? '　'.repeat(item.depth) + '└ ' : '' }}{{ item.unit.name || '未命名单元' }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <label>单元类型</label>
                  <select v-model="deploymentUnitDraft.unit_type">
                    <option value="">请选择</option>
                    <option v-for="type in deploymentUnitTypes" :key="type" :value="type">{{ getDeploymentUnitTypeLabel(type) }}</option>
                  </select>
                </div>
                <div class="field field-md">
                  <div class="field-md-header">
                    <label>说明（MD）</label>
                    <button type="button" class="btn-md-toggle" @click="toggleDeploymentUnitMdPreview('description')">{{ deploymentUnitMdShowPreview.description ? '源码' : '效果' }}</button>
                  </div>
                  <textarea v-if="!deploymentUnitMdShowPreview.description" v-model="deploymentUnitDraft.description" class="textarea-md-field" rows="3" placeholder="说明，支持 Markdown" />
                  <div v-else class="md-preview" v-html="renderMd(deploymentUnitDraft.description)" />
                </div>
                <div class="field field-md">
                  <div class="field-md-header">
                    <label>部署配置（MD）</label>
                    <button type="button" class="btn-md-toggle" @click="toggleDeploymentUnitMdPreview('deployment_config')">{{ deploymentUnitMdShowPreview.deployment_config ? '源码' : '效果' }}</button>
                  </div>
                  <textarea v-if="!deploymentUnitMdShowPreview.deployment_config" v-model="deploymentUnitDraft.deployment_config" class="textarea-md-field" rows="5" placeholder="部署配置（JSON），支持 Markdown" />
                  <div v-else class="md-preview" v-html="renderMd(deploymentUnitDraft.deployment_config)" />
                </div>
                <div class="field">
                  <button type="button" class="btn primary" @click="handleSaveDeploymentUnit">保存</button>
                </div>
              </div>
              <div v-show="detailTab === 'deployment' && currentView === 'deploy'" class="detail-form deployment-relations">
                <div v-if="deploymentRelationsLoading" class="interface-loading">加载中…</div>
                <template v-else>
                  <div class="build-section">
                    <div class="interface-section-head">
                      <span class="interface-section-title">映射的构建产物</span>
                      <button type="button" class="btn btn-sm" @click.stop="openAddArtifactToDeploymentDialog">添加</button>
                    </div>
                    <div v-if="!artifactToDeploymentsList.length" class="interface-empty">暂无数据</div>
                    <ul v-else class="interface-list">
                      <li v-for="item in artifactToDeploymentsList" :key="item.id" class="interface-item">
                        <div class="interface-item-summary">
                          <span class="interface-name">{{ getArtifactName(item.build_artifact_id) }}</span>
                          <span v-if="item.description" class="interface-rel-desc">{{ item.description }}</span>
                          <button type="button" class="btn-remove" aria-label="删除" @click="removeArtifactToDeployment(item.id)">删除</button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </template>
              </div>
            </template>
          </div>
          <div v-else>
            <div v-if="!selectedNode" class="placeholder">请选择左侧树中的节点</div>
            <template v-else>
              <div class="detail-tabs">
                <button type="button" class="detail-tab" :class="{ active: detailTab === 'basic' }" @click="detailTab = 'basic'">基本信息</button>
                <button v-if="currentView === 'logical'" type="button" class="detail-tab" :class="{ active: detailTab === 'interface' }" @click="detailTab = 'interface'">接口信息</button>
              </div>
            <div v-show="detailTab === 'basic'" class="detail-form">
            <div class="field">
              <label>名称</label>
              <input v-model="nodeDraft.name" type="text" placeholder="节点名称" />
            </div>
            <div class="field">
              <label>父节点</label>
              <select v-model="nodeDraft.parentId" class="parent-select">
                <option value="">根（无父节点）</option>
                <option
                  v-for="item in parentOptions"
                  :key="item.node.id"
                  :value="item.node.id"
                >
                  {{ item.depth ? '　'.repeat(item.depth) + '└ ' : '' }}{{ item.node.name || '未命名节点' }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>类型</label>
              <select v-model="nodeDraft.type">
                <option v-for="opt in NODE_TYPES" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
              </select>
            </div>
            <div class="field">
              <label>编码/代号</label>
              <input v-model="nodeDraft.code" type="text" placeholder="选填" />
            </div>
            <div class="field">
              <label>代码仓地址</label>
              <input v-model="nodeDraft.codeRepoUrl" type="text" placeholder="选填" />
            </div>
            <div class="field">
              <label>代码仓内相对路径</label>
              <input v-model="nodeDraft.codeRepoPath" type="text" placeholder="选填" />
            </div>
            <div class="field field-md">
              <div class="field-md-header">
                <label>职责/目的（MD）</label>
                <button type="button" class="btn-md-toggle" @click="toggleMdPreview('description')">{{ mdShowPreview.description ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!mdShowPreview.description" v-model="nodeDraft.description" class="textarea-md-field" rows="4" placeholder="选填，支持 Markdown" />
              <div v-else class="md-preview" v-html="renderMd(nodeDraft.description)" />
            </div>
            <div class="field field-md">
              <div class="field-md-header">
                <label>详细定义（MD）</label>
                <button type="button" class="btn-md-toggle" @click="toggleMdPreview('contentMd')">{{ mdShowPreview.contentMd ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!mdShowPreview.contentMd" v-model="nodeDraft.contentMd" class="textarea-md" rows="8" placeholder="选填，支持 Markdown，用于生成架构文档" />
              <div v-else class="md-preview md-preview-lg" v-html="renderMd(nodeDraft.contentMd)" />
            </div>
            <div class="field field-md">
              <div class="field-md-header">
                <label>技术栈（MD）</label>
                <button type="button" class="btn-md-toggle" @click="toggleMdPreview('techStack')">{{ mdShowPreview.techStack ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!mdShowPreview.techStack" v-model="nodeDraft.techStack" class="textarea-md-field" rows="3" placeholder="选填，支持 Markdown" />
              <div v-else class="md-preview" v-html="renderMd(nodeDraft.techStack)" />
            </div>
            <div class="field field-md">
              <div class="field-md-header">
                <label>质量属性（MD）</label>
                <button type="button" class="btn-md-toggle" @click="toggleMdPreview('qualityAttributes')">{{ mdShowPreview.qualityAttributes ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!mdShowPreview.qualityAttributes" v-model="nodeDraft.qualityAttributes" class="textarea-md-field" rows="3" placeholder="选填，支持 Markdown" />
              <div v-else class="md-preview" v-html="renderMd(nodeDraft.qualityAttributes)" />
            </div>
            <div class="field field-md">
              <div class="field-md-header">
                <label>约束（MD）</label>
                <button type="button" class="btn-md-toggle" @click="toggleMdPreview('constraints')">{{ mdShowPreview.constraints ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!mdShowPreview.constraints" v-model="nodeDraft.constraints" class="textarea-md-field" rows="3" placeholder="选填，支持 Markdown" />
              <div v-else class="md-preview" v-html="renderMd(nodeDraft.constraints)" />
            </div>
            <div class="field field-md">
              <div class="field-md-header">
                <label>规格（MD）</label>
                <button type="button" class="btn-md-toggle" @click="toggleMdPreview('specifications')">{{ mdShowPreview.specifications ? '源码' : '效果' }}</button>
              </div>
              <textarea v-if="!mdShowPreview.specifications" v-model="nodeDraft.specifications" class="textarea-md-field" rows="3" placeholder="选填，支持 Markdown" />
              <div v-else class="md-preview" v-html="renderMd(nodeDraft.specifications)" />
            </div>
            <div class="form-actions">
              <button type="button" class="btn" @click="handleSaveNode">保存</button>
            </div>
            </div>
            <div v-show="detailTab === 'interface'" class="detail-form interface-info">
              <div v-if="interfaceLoading" class="interface-loading">加载中…</div>
              <template v-else>
                <div class="interface-section">
                  <div
                    class="interface-section-head"
                    @click.capture="onAddProvidesClick"
                  >
                    <span class="interface-section-title">提供的接口</span>
                    <button type="button" class="btn btn-sm btn-add-provides">添加</button>
                  </div>
                  <div v-if="!elementProvidesList.length" class="interface-empty">暂无数据</div>
                  <ul v-else class="interface-list">
                    <li v-for="({ item, depth }) in providedInterfacesWithDepth" :key="item.id" class="interface-item">
                      <div class="interface-item-summary" :style="{ paddingLeft: depth ? `${12 + depth * 20}px` : '12px' }">
                        <span v-if="depth" class="interface-tree-prefix">└ </span>
                        <span class="interface-name">{{ item.interface?.name || '—' }}</span>
                        <span v-if="item.interface?.code" class="interface-code">{{ item.interface.code }}</span>
                        <span v-if="item.interface?.interface_category" class="interface-meta">{{ getInterfaceCategoryLabel(item.interface.interface_category) }}</span>
                        <span v-if="item.interface?.interface_type" class="interface-type">{{ getInterfaceTypeLabel(item.interface.interface_type) }}</span>
                        <span v-if="item.description" class="interface-rel-desc">{{ item.description }}</span>
                        <button type="button" class="btn-expand" @click="toggleInterfaceExpand(item.id)">{{ expandedInterfaceItemId === item.id ? '收起' : '详情' }}</button>
                        <button type="button" class="btn-remove" aria-label="删除" @click="removeElementInterface(item.id)">删除</button>
                      </div>
                      <div v-if="expandedInterfaceItemId === item.id && item.interface" class="interface-item-detail">
                        <div class="interface-detail-row"><span class="detail-label">说明</span><span class="detail-value">{{ item.interface.description || '—' }}</span></div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">功能级定义（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'definition')">{{ getInterfaceMdPreview(item.id, 'definition') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'definition')">
                            <div class="md-preview small" v-html="renderMd(item.interface.definition)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.definition || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">规格（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'specification')">{{ getInterfaceMdPreview(item.id, 'specification') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'specification')">
                            <div class="md-preview small" v-html="renderMd(item.interface.specification)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.specification || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">约束（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'constraints')">{{ getInterfaceMdPreview(item.id, 'constraints') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'constraints')">
                            <div class="md-preview small" v-html="renderMd(item.interface.constraints)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.constraints || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">技术栈（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'tech_stack')">{{ getInterfaceMdPreview(item.id, 'tech_stack') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'tech_stack')">
                            <div class="md-preview small" v-html="renderMd(item.interface.tech_stack)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.tech_stack || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row"><span class="detail-label">父接口</span><span class="detail-value">{{ item.interface.parent_id || '—' }}</span></div>
                        <div class="interface-detail-row"><span class="detail-label">创建时间</span><span class="detail-value">{{ formatDateTime(item.interface.created_at) }}</span></div>
                        <div v-if="item.interface.updated_at" class="interface-detail-row"><span class="detail-label">更新时间</span><span class="detail-value">{{ formatDateTime(item.interface.updated_at) }}</span></div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div class="interface-section">
                  <div
                    class="interface-section-head"
                    @click.capture="onAddUsesClick"
                  >
                    <span class="interface-section-title">依赖的接口</span>
                    <button type="button" class="btn btn-sm btn-add-uses">添加</button>
                  </div>
                  <div v-if="!elementUsesList.length" class="interface-empty">暂无数据</div>
                  <ul v-else class="interface-list">
                    <li v-for="({ item, depth }) in usedInterfacesWithDepth" :key="item.id" class="interface-item">
                      <div class="interface-item-summary" :style="{ paddingLeft: depth ? `${12 + depth * 20}px` : '12px' }">
                        <span v-if="depth" class="interface-tree-prefix">└ </span>
                        <span class="interface-name">{{ item.interface?.name || '—' }}</span>
                        <span v-if="item.interface?.code" class="interface-code">{{ item.interface.code }}</span>
                        <span v-if="item.interface?.interface_category" class="interface-meta">{{ getInterfaceCategoryLabel(item.interface.interface_category) }}</span>
                        <span v-if="item.interface?.interface_type" class="interface-type">{{ getInterfaceTypeLabel(item.interface.interface_type) }}</span>
                        <span v-if="item.providers?.length" class="interface-providers">由: {{ item.providers.join(', ') }}</span>
                        <span v-if="item.description" class="interface-rel-desc">{{ item.description }}</span>
                        <button type="button" class="btn-expand" @click="toggleInterfaceExpand(item.id)">{{ expandedInterfaceItemId === item.id ? '收起' : '详情' }}</button>
                        <button type="button" class="btn-remove" aria-label="删除" @click="removeElementInterface(item.id)">删除</button>
                      </div>
                      <div v-if="expandedInterfaceItemId === item.id && item.interface" class="interface-item-detail">
                        <div class="interface-detail-row"><span class="detail-label">说明</span><span class="detail-value">{{ item.interface.description || '—' }}</span></div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">功能级定义（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'definition')">{{ getInterfaceMdPreview(item.id, 'definition') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'definition')">
                            <div class="md-preview small" v-html="renderMd(item.interface.definition)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.definition || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">规格（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'specification')">{{ getInterfaceMdPreview(item.id, 'specification') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'specification')">
                            <div class="md-preview small" v-html="renderMd(item.interface.specification)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.specification || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">约束（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'constraints')">{{ getInterfaceMdPreview(item.id, 'constraints') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'constraints')">
                            <div class="md-preview small" v-html="renderMd(item.interface.constraints)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.constraints || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row field-md">
                          <div class="field-md-header">
                            <span class="detail-label">技术栈（MD）</span>
                            <button type="button" class="btn-md-toggle" @click="toggleInterfaceMd(item.id, 'tech_stack')">{{ getInterfaceMdPreview(item.id, 'tech_stack') ? '源码' : '效果' }}</button>
                          </div>
                          <template v-if="!getInterfaceMdPreview(item.id, 'tech_stack')">
                            <div class="md-preview small" v-html="renderMd(item.interface.tech_stack)" />
                          </template>
                          <pre v-else class="interface-md-src">{{ item.interface.tech_stack || '—' }}</pre>
                        </div>
                        <div class="interface-detail-row"><span class="detail-label">父接口</span><span class="detail-value">{{ getParentInterfaceName(item.interface.parent_id) }}</span></div>
                        <div class="interface-detail-row"><span class="detail-label">创建时间</span><span class="detail-value">{{ formatDateTime(item.interface.created_at) }}</span></div>
                        <div v-if="item.interface.updated_at" class="interface-detail-row"><span class="detail-label">更新时间</span><span class="detail-value">{{ formatDateTime(item.interface.updated_at) }}</span></div>
                      </div>
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </template>
          </div>
        </div>
      </div>

      <div class="panel panel-right">
        <div class="panel-header panel-header-doc">
          <span class="panel-title">架构设计文档（MD）</span>
          <button type="button" class="btn-md-toggle" @click="docShowPreview = !docShowPreview">{{ docShowPreview ? '源码' : '效果' }}</button>
        </div>
        <div class="panel-body doc">
          <textarea v-if="!docShowPreview" v-model="docDraft" class="doc-textarea" placeholder="可点击「生成文档」从服务端获取该版本的架构文档（根据当前架构元素自动生成）。" readonly />
          <div v-else class="md-preview md-preview-doc" v-html="renderMd(docDraft)" />
          <div class="form-actions doc-actions">
            <button type="button" class="btn primary" :disabled="docLoading" @click="handleGenerateDoc">{{ docLoading ? '生成中…' : '生成文档' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import {
  listElementInterfaces,
  listInterfaces,
  createInterface,
  createElementInterface,
  deleteElementInterface,
  getInterfaceCategories,
  getPhysicalInterfaceTypes,
  getBuildArtifactTypes,
  listBuildArtifacts,
  listBuildArtifactsTree,
  createBuildArtifact,
  updateBuildArtifact,
  deleteBuildArtifact,
  listElementToArtifacts,
  createElementToArtifact,
  deleteElementToArtifact,
  listArtifactToArtifacts,
  createArtifactToArtifact,
  deleteArtifactToArtifact,
  getDeploymentUnitTypes,
  listDeploymentUnits,
  listDeploymentUnitsTree,
  getDeploymentUnit,
  createDeploymentUnit,
  updateDeploymentUnit,
  deleteDeploymentUnit,
  listArtifactToDeployments,
  createArtifactToDeployment,
  updateArtifactToDeployment,
  deleteArtifactToDeployment,
} from '../../api/architecture.js'
import { isProductLoggedIn, isProductNeedLoginError } from '../../api/requestProduct.js'
import { useProductSelection } from '../../composables/useProductSelection.js'
import { useArchitecture } from '../../composables/useArchitecture.js'

const mdShowPreview = ref({
  description: false,
  contentMd: false,
  techStack: false,
  qualityAttributes: false,
  constraints: false,
  specifications: false,
})
const artifactMdShowPreview = ref({
  build_command: false,
  build_environment: false,
  description: false,
})
const docShowPreview = ref(false)
const detailTab = ref('basic')
function toggleMdPreview(key) {
  mdShowPreview.value[key] = !mdShowPreview.value[key]
}
function toggleArtifactMdPreview(key) {
  artifactMdShowPreview.value[key] = !artifactMdShowPreview.value[key]
}
function renderMd(text) {
  const s = text != null ? String(text).trim() : ''
  if (!s) return '<p class="md-empty">暂无内容</p>'
  return marked.parse(s)
}

const viewSelectRef = ref(null)
const viewSelectOpen = ref(false)
const currentView = ref('logical')
const views = [
  { id: 'logical', label: '逻辑视图' },
  { id: 'impl', label: '实现视图' },
  { id: 'deploy', label: '部署视图' },
]
const currentViewLabel = computed(() => views.find((v) => v.id === currentView.value)?.label || '')

function handleViewChange(viewId) {
  currentView.value = viewId
  viewSelectOpen.value = false
}

watch(currentView, (newView, oldView) => {
  if (oldView && newView !== oldView) {
    expandedInterfaceItemId.value = null
    if (newView === 'logical' && detailTab.value === 'build') {
      detailTab.value = 'basic'
    } else if (newView === 'impl' && detailTab.value === 'interface') {
      detailTab.value = 'basic'
    } else if (newView === 'deploy' && (detailTab.value === 'interface' || detailTab.value === 'build')) {
      detailTab.value = 'basic'
    }
    selectedNodeId.value = ''
    selectedArtifactId.value = ''
    selectedDeploymentUnitId.value = ''
    if (newView === 'impl') {
      loadBuildArtifactsTree()
      if (!buildArtifactTypes.value.length) {
        getBuildArtifactTypes().then((types) => {
          buildArtifactTypes.value = Array.isArray(types) ? types : []
        }).catch(() => {
          buildArtifactTypes.value = []
        })
      }
    } else if (newView === 'deploy') {
      loadDeploymentUnitsTree()
      if (!deploymentUnitTypes.value.length) {
        getDeploymentUnitTypes().then((types) => {
          deploymentUnitTypes.value = Array.isArray(types) ? types : []
        }).catch(() => {
          deploymentUnitTypes.value = []
        })
      }
    }
  }
})

const INTERFACE_CATEGORY_LABELS = { logical: '逻辑接口', physical: '物理接口' }
const INTERFACE_TYPE_LABELS = {
  rest_api: 'REST API',
  grpc: 'gRPC',
  message_queue: '消息队列',
  function_call: '函数调用',
  rpc: 'RPC',
  database: '数据库连接',
  file: '文件',
  other: '其他',
}
function getInterfaceCategoryLabel(value) {
  return value ? (INTERFACE_CATEGORY_LABELS[value] || value) : ''
}
function getInterfaceTypeLabel(value) {
  return value ? (INTERFACE_TYPE_LABELS[value] || value) : ''
}

function getParentInterfaceName(parentId) {
  if (!parentId) return '—'
  const parent = versionInterfacesList.value.find((i) => i.id === parentId)
  return parent ? (parent.name || parent.code || parentId) : parentId
}

const ARTIFACT_TYPE_LABELS = {
  jar: 'JAR包',
  war: 'WAR包',
  docker_image: 'Docker镜像',
  binary: '二进制文件',
  npm_package: 'NPM包',
  python_package: 'Python包',
  library: '库文件',
  zip: 'ZIP压缩包',
  tar: 'TAR压缩包',
  tar_gz: 'TAR.GZ压缩包',
  other: '其他',
}
function getArtifactTypeLabel(value) {
  return value ? (ARTIFACT_TYPE_LABELS[value] || value) : ''
}

const DEPLOYMENT_UNIT_TYPE_LABELS = {
  cluster: '集群',
  node: '节点',
  namespace: '命名空间',
  pod: 'Pod',
  container: '容器',
  vm: '虚拟机',
  instance: '实例',
  function: '函数计算单元',
  other: '其他',
}
function getDeploymentUnitTypeLabel(value) {
  return value ? (DEPLOYMENT_UNIT_TYPE_LABELS[value] || value) : ''
}

function getArtifactName(artifactId) {
  if (!artifactId) return '—'
  const artifact = buildArtifactsList.value.find((a) => a.id === artifactId)
  return artifact ? artifact.name : artifactId
}

function getElementName(elementId) {
  if (!elementId) return '—'
  const node = flatNodes.value.find(({ node: n }) => n.id === elementId)?.node
  return node ? (node.name || '未命名节点') : elementId
}

function getElementType(elementId) {
  if (!elementId) return null
  const node = flatNodes.value.find(({ node: n }) => n.id === elementId)?.node
  return node ? node.type : null
}

function flattenArtifactTree(roots) {
  const out = []
  const walk = (node, depth) => {
    if (!node) return
    out.push({ artifact: node, depth })
    const children = node.children || []
    children.forEach((c) => walk(c, depth + 1))
  }
  roots.forEach((r) => walk(r, 0))
  return out
}

function flattenDeploymentUnitTree(roots) {
  const out = []
  const walk = (node, depth) => {
    if (!node) return
    out.push({ unit: node, depth })
    const children = node.children || []
    children.forEach((c) => walk(c, depth + 1))
  }
  roots.forEach((r) => walk(r, 0))
  return out
}

async function loadBuildArtifactsTree() {
  const versionId = selectedVersionId.value
  if (!versionId) {
    buildArtifactsTreeFlat.value = []
    return
  }
  buildArtifactsTreeLoading.value = true
  try {
    const tree = await listBuildArtifactsTree(versionId)
    buildArtifactsTreeFlat.value = flattenArtifactTree(Array.isArray(tree) ? tree : [])
    if (selectedArtifactId.value && !buildArtifactsTreeFlat.value.find((i) => i.artifact.id === selectedArtifactId.value)) {
      selectedArtifactId.value = ''
    }
  } catch (e) {
    console.error('加载构建产物树失败:', e)
    buildArtifactsTreeFlat.value = []
    if (selectedArtifactId.value) selectedArtifactId.value = ''
  } finally {
    buildArtifactsTreeLoading.value = false
  }
}

async function loadDeploymentUnitsTree() {
  const versionId = selectedVersionId.value
  if (!versionId) {
    deploymentUnitsTreeFlat.value = []
    return
  }
  deploymentUnitsTreeLoading.value = true
  try {
    const tree = await listDeploymentUnitsTree(versionId)
    deploymentUnitsTreeFlat.value = flattenDeploymentUnitTree(Array.isArray(tree) ? tree : [])
    if (selectedDeploymentUnitId.value && !deploymentUnitsTreeFlat.value.find((i) => i.unit.id === selectedDeploymentUnitId.value)) {
      selectedDeploymentUnitId.value = ''
    }
  } catch (e) {
    console.error('加载部署单元树失败:', e)
    deploymentUnitsTreeFlat.value = []
    if (selectedDeploymentUnitId.value) selectedDeploymentUnitId.value = ''
  } finally {
    deploymentUnitsTreeLoading.value = false
  }
}

const NODE_TYPES = [
  { id: 'component', label: '组件', icon: '📦' },
  { id: 'module', label: '模块', icon: '📦' },
  { id: 'subsystem', label: '子系统', icon: '📦' },
  { id: 'service', label: '服务', icon: '🧩' },
  { id: 'microservice', label: '微服务', icon: '🧩' },
  { id: 'api', label: '接口/API', icon: '🔌' },
  { id: 'gateway', label: '网关', icon: '🚪' },
  { id: 'data', label: '数据', icon: '🗄️' },
  { id: 'database', label: '数据库', icon: '🗄️' },
  { id: 'cache', label: '缓存', icon: '⚡' },
  { id: 'mq', label: '消息队列', icon: '📨' },
  { id: 'storage', label: '存储', icon: '💾' },
  { id: 'infra', label: '基础设施', icon: '🧱' },
  { id: 'middleware', label: '中间件', icon: '⚙️' },
  { id: 'lb', label: '负载均衡', icon: '⚖️' },
  { id: 'app', label: '应用', icon: '📱' },
  { id: 'other', label: '其它', icon: '📌' },
]

function onViewSelectDocumentClick(e) {
  if (viewSelectOpen.value && viewSelectRef.value && !viewSelectRef.value.contains(e.target)) {
    viewSelectOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onViewSelectDocumentClick))
onUnmounted(() => document.removeEventListener('click', onViewSelectDocumentClick))

const { selectedVersionId } = useProductSelection()
const hasVersion = computed(() => !!selectedVersionId.value)

watch(selectedVersionId, (versionId) => {
  if (currentView.value === 'impl' && versionId) {
    loadBuildArtifactsTree()
    if (!buildArtifactTypes.value.length) {
      getBuildArtifactTypes().then((types) => {
        buildArtifactTypes.value = Array.isArray(types) ? types : []
      }).catch(() => {
        buildArtifactTypes.value = []
      })
    }
  } else if (currentView.value === 'deploy' && versionId) {
    loadDeploymentUnitsTree()
    if (!deploymentUnitTypes.value.length) {
      getDeploymentUnitTypes().then((types) => {
        deploymentUnitTypes.value = Array.isArray(types) ? types : []
      }).catch(() => {
        deploymentUnitTypes.value = []
      })
    }
  }
}, { immediate: true })

const {
  flatNodes,
  selectedNodeId,
  selectedNode,
  loading,
  docLoading,
  addNode,
  updateNode,
  deleteNode,
  doc,
  setDoc,
  fetchDoc,
} = useArchitecture(selectedVersionId, currentView)

const nodeDraft = ref({
  name: '',
  parentId: '',
  type: 'component',
  code: '',
  codeRepoUrl: '',
  codeRepoPath: '',
  description: '',
  contentMd: '',
  techStack: '',
  qualityAttributes: '',
  constraints: '',
  specifications: '',
})
const docDraft = ref('')

function getDescendantIds(nodeId) {
  const node = flatNodes.value.find(({ node: n }) => n.id === nodeId)?.node
  if (!node) return new Set()
  const ids = new Set()
  const walk = (n) => {
    ;(n.children || []).forEach((c) => {
      ids.add(c.id)
      walk(c)
    })
  }
  walk(node)
  return ids
}

const parentOptions = computed(() => {
  const sid = selectedNodeId.value
  if (!sid) return []
  const descendantIds = getDescendantIds(sid)
  return flatNodes.value.filter(
    (item) => item.node.id !== sid && !descendantIds.has(item.node.id)
  )
})

function getDeploymentUnitDescendantIds(unitId) {
  const unit = deploymentUnitsTreeFlat.value.find(({ unit: u }) => u.id === unitId)?.unit
  if (!unit) return new Set()
  const ids = new Set()
  const walk = (u) => {
    const children = deploymentUnitsTreeFlat.value.filter(({ unit: child }) => child.parent_unit_id === u.id)
    children.forEach(({ unit: child }) => {
      ids.add(child.id)
      walk(child)
    })
  }
  walk(unit)
  return ids
}

const deploymentUnitParentOptions = computed(() => {
  const sid = selectedDeploymentUnitId.value
  if (!sid) return deploymentUnitsTreeFlat.value
  const descendantIds = getDeploymentUnitDescendantIds(sid)
  return deploymentUnitsTreeFlat.value.filter(
    (item) => item.unit.id !== sid && !descendantIds.has(item.unit.id)
  )
})

watch(
  selectedNode,
  (n) => {
    if (!n) {
      nodeDraft.value = {
        name: '',
        parentId: '',
        type: 'component',
        code: '',
        codeRepoUrl: '',
        codeRepoPath: '',
        description: '',
        contentMd: '',
        techStack: '',
        qualityAttributes: '',
        constraints: '',
        specifications: '',
      }
      return
    }
    nodeDraft.value = {
      name: n.name || '',
      parentId: n.parentId ?? '',
      type: n.type || 'component',
      code: n.code || '',
      codeRepoUrl: n.codeRepoUrl || '',
      codeRepoPath: n.codeRepoPath || '',
      description: n.description || '',
      contentMd: n.contentMd || '',
      techStack: n.techStack || '',
      qualityAttributes: n.qualityAttributes || '',
      constraints: n.constraints || '',
      specifications: n.specifications || '',
    }
  },
  { immediate: true }
)

watch(
  doc,
  (d) => {
    docDraft.value = typeof d === 'string' ? d : ''
  },
  { immediate: true }
)

const elementProvidesList = ref([])
const elementUsesList = ref([])
const interfaceLoading = ref(false)
const versionInterfacesList = ref([])
const showCreateInterfaceDialog = ref(false)
const createInterfaceForm = ref({
  interface_category: '',
  parent_id: '',
  name: '',
  code: '',
  description: '',
  definition: '',
  specification: '',
  constraints: '',
  interface_type: '',
  tech_stack: '',
})
const interfaceCategories = ref([])
const physicalInterfaceTypes = ref([])
const showAddRelationDialog = ref(false)
const addRelationInterfaceId = ref('')
const addRelationDescription = ref('')

const expandedInterfaceItemId = ref(null)
const interfaceMdPreview = ref({})

const buildArtifactsTreeLoading = ref(false)
const buildArtifactsTreeFlat = ref([])
const selectedArtifactId = ref('')
const selectedArtifact = computed(() => {
  if (!selectedArtifactId.value) return null
  const item = buildArtifactsTreeFlat.value.find((i) => i.artifact.id === selectedArtifactId.value)
  return item?.artifact || null
})

const deploymentUnitsTreeLoading = ref(false)
const deploymentUnitsTreeFlat = ref([])
const selectedDeploymentUnitId = ref('')
const selectedDeploymentUnit = computed(() => {
  if (!selectedDeploymentUnitId.value) return null
  const item = deploymentUnitsTreeFlat.value.find((i) => i.unit.id === selectedDeploymentUnitId.value)
  return item?.unit || null
})

const buildRelationsLoading = ref(false)
const elementToArtifactsList = ref([])
const artifactRelationsList = ref([])
const buildArtifactsList = ref([])
const buildArtifactTypes = ref([])

const deploymentRelationsLoading = ref(false)
const artifactToDeploymentsList = ref([])
const deploymentUnitsList = ref([])
const deploymentUnitTypes = ref([])
const showAddArtifactToDeploymentDialog = ref(false)
const addArtifactToDeploymentForm = ref({
  build_artifact_id: '',
  deployment_config: '',
  description: '',
})
const showAddElementToArtifactDialog = ref(false)
const addElementToArtifactForm = ref({
  element_id: '',
  build_artifact_id: '',
  build_order: 0,
  description: '',
})
const showAddArtifactToArtifactDialog = ref(false)
const addArtifactToArtifactForm = ref({
  input_artifact_id: '',
  target_artifact_id: '',
  build_order: 0,
  description: '',
})

const artifactDraft = ref({
  name: '',
  artifact_type: '',
  build_command: '',
  build_environment: '',
  description: '',
})

const deploymentUnitDraft = ref({
  name: '',
  parent_unit_id: '',
  unit_type: '',
  description: '',
  deployment_config: '',
})
const deploymentUnitMdShowPreview = ref({
  description: false,
  deployment_config: false,
})
function toggleDeploymentUnitMdPreview(key) {
  deploymentUnitMdShowPreview.value[key] = !deploymentUnitMdShowPreview.value[key]
}

const addArtifactToDeploymentMdShowPreview = ref({
  deployment_config: false,
})
function toggleAddArtifactToDeploymentMdPreview(key) {
  addArtifactToDeploymentMdShowPreview.value[key] = !addArtifactToDeploymentMdShowPreview.value[key]
}

function toggleInterfaceExpand(itemId) {
  expandedInterfaceItemId.value = expandedInterfaceItemId.value === itemId ? null : itemId
}

function getInterfaceMdPreviewKey(itemId, field) {
  return `${itemId}_${field}`
}

function getInterfaceMdPreview(itemId, field) {
  return !!interfaceMdPreview.value[getInterfaceMdPreviewKey(itemId, field)]
}

function toggleInterfaceMd(itemId, field) {
  const key = getInterfaceMdPreviewKey(itemId, field)
  interfaceMdPreview.value = { ...interfaceMdPreview.value, [key]: !interfaceMdPreview.value[key] }
}

function formatDateTime(d) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return isNaN(date.getTime()) ? String(d) : date.toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })
}

const addRelationInterfaceOptions = computed(() => {
  const usedIds = new Set(elementUsesList.value.map((item) => item.interface_id))
  return versionInterfacesList.value.filter((iface) => !usedIds.has(iface.id))
})

function buildInterfacesWithDepth(list) {
  const items = list.filter((entry) => entry.interface?.id)
  const byId = new Map(items.map((entry) => [entry.interface.id, entry]))
  const roots = items.filter((entry) => !entry.interface.parent_id || !byId.has(entry.interface.parent_id))
  const childrenMap = new Map()
  for (const entry of items) {
    const pid = entry.interface?.parent_id
    if (!pid) continue
    if (!childrenMap.has(pid)) childrenMap.set(pid, [])
    childrenMap.get(pid).push(entry)
  }
  const result = []
  function walk(entries, depth) {
    for (const entry of entries) {
      result.push({ item: entry, depth })
      const kids = childrenMap.get(entry.interface?.id) || []
      walk(kids, depth + 1)
    }
  }
  walk(roots, 0)
  return result
}

const providedInterfacesWithDepth = computed(() => buildInterfacesWithDepth(elementProvidesList.value))
const usedInterfacesWithDepth = computed(() => buildInterfacesWithDepth(elementUsesList.value))

const canSubmitCreateInterface = computed(() => {
  const f = createInterfaceForm.value
  return !!f.name?.trim() && !!f.interface_category
})

async function loadElementInterfaces() {
  const versionId = selectedVersionId.value
  const node = selectedNode.value
  if (!versionId || !node?.id) {
    elementProvidesList.value = []
    elementUsesList.value = []
    versionInterfacesList.value = []
    return
  }
  interfaceLoading.value = true
  try {
    const [elemIfaces, interfaces] = await Promise.all([
      listElementInterfaces(versionId, { element_id: node.id }),
      listInterfaces(versionId),
    ])
    const ifaceMap = new Map(interfaces.map((i) => [i.id, i]))
    const withIface = (item) => ({ ...item, interface: ifaceMap.get(item.interface_id) })
    elementProvidesList.value = elemIfaces
      .filter((e) => e.relation_type === 'provides')
      .map(withIface)
    const usesList = elemIfaces.filter((e) => e.relation_type === 'uses').map(withIface)
    const elementMap = new Map(flatNodes.value.map((item) => [item.node.id, item.node]))
    const usesWithProviders = await Promise.all(
      usesList.map(async (item) => {
        if (!item.interface_id) return { ...item, providers: [] }
        try {
          const providers = await listElementInterfaces(versionId, {
            interface_id: item.interface_id,
            relation_type: 'provides',
          })
          const providerNames = providers
            .map((p) => {
              const elem = elementMap.get(p.element_id)
              return elem ? elem.name || elem.code || p.element_id : p.element_id
            })
            .filter(Boolean)
          return { ...item, providers: providerNames }
        } catch (_) {
          return { ...item, providers: [] }
        }
      })
    )
    elementUsesList.value = usesWithProviders
    versionInterfacesList.value = interfaces
  } catch (e) {
    elementProvidesList.value = []
    elementUsesList.value = []
    versionInterfacesList.value = []
  } finally {
    interfaceLoading.value = false
  }
}

watch(
  [() => detailTab.value, selectedNode, selectedVersionId, currentView],
  ([tab, node, versionId, view]) => {
    expandedInterfaceItemId.value = null
    if (tab === 'interface' && node?.id && versionId && view === 'logical') loadElementInterfaces()
    if (tab === 'build' && node?.id && versionId && view === 'impl') loadBuildRelations()
  }
)

function onAddProvidesClick(e) {
  if (e.target.closest('.btn-add-provides')) {
    e.preventDefault()
    e.stopPropagation()
    openCreateInterfaceDialog()
  }
}

function openCreateInterfaceDialog() {
  createInterfaceForm.value = {
    interface_category: '',
    parent_id: '',
    name: '',
    code: '',
    description: '',
    definition: '',
    specification: '',
    constraints: '',
    interface_type: '',
    tech_stack: '',
  }
  showCreateInterfaceDialog.value = true
  const versionId = selectedVersionId.value
  getInterfaceCategories().then((cats) => { interfaceCategories.value = Array.isArray(cats) ? cats : [] }).catch(() => { interfaceCategories.value = [] })
  getPhysicalInterfaceTypes().then((types) => { physicalInterfaceTypes.value = Array.isArray(types) ? types : [] }).catch(() => { physicalInterfaceTypes.value = [] })
  if (versionId && !versionInterfacesList.value.length) {
    listInterfaces(versionId).then((list) => { versionInterfacesList.value = list || [] }).catch(() => { versionInterfacesList.value = [] })
  }
}

async function submitCreateInterface() {
  const versionId = selectedVersionId.value
  const node = selectedNode.value
  if (!versionId || !node?.id) return
  const f = createInterfaceForm.value
  const name = f.name?.trim()
  const interface_category = f.interface_category
  if (!name || !interface_category) return
  try {
    const created = await createInterface({
      version_id: versionId,
      interface_category,
      parent_id: f.parent_id || null,
      name,
      code: f.code?.trim() || null,
      description: f.description?.trim() || null,
      definition: f.definition?.trim() || null,
      specification: f.specification?.trim() || null,
      constraints: f.constraints?.trim() || null,
      interface_type: f.interface_type || null,
      tech_stack: f.tech_stack?.trim() || null,
    })
    await createElementInterface({
      version_id: versionId,
      element_id: node.id,
      interface_id: created.id,
      relation_type: 'provides',
    })
    showCreateInterfaceDialog.value = false
    await loadElementInterfaces()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '新增接口失败')
  }
}

function onAddUsesClick(e) {
  if (e.target.closest('.btn-add-uses')) {
    e.preventDefault()
    e.stopPropagation()
    openAddRelationUses()
  }
}

function openAddRelationUses() {
  addRelationInterfaceId.value = ''
  addRelationDescription.value = ''
  showAddRelationDialog.value = true
}

async function submitAddRelation() {
  const versionId = selectedVersionId.value
  const node = selectedNode.value
  const interfaceId = addRelationInterfaceId.value
  if (!versionId || !node?.id || !interfaceId) return
  try {
    await createElementInterface({
      version_id: versionId,
      element_id: node.id,
      interface_id: interfaceId,
      relation_type: 'uses',
      description: addRelationDescription.value?.trim() || undefined,
    })
    showAddRelationDialog.value = false
    await loadElementInterfaces()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '添加失败')
  }
}

async function removeElementInterface(elemIfaceId) {
  if (!window.confirm('确定移除该接口关系？')) return
  try {
    await deleteElementInterface(elemIfaceId)
    await loadElementInterfaces()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '删除失败')
  }
}

async function loadBuildRelations() {
  const versionId = selectedVersionId.value
  if (!versionId) {
    elementToArtifactsList.value = []
    artifactRelationsList.value = []
    buildArtifactsList.value = []
    return
  }
  buildRelationsLoading.value = true
  try {
    const [artifacts, artifactRelations] = await Promise.all([
      listBuildArtifacts(versionId).catch(() => []),
      listArtifactToArtifacts(versionId).catch(() => []),
    ])
    buildArtifactsList.value = Array.isArray(artifacts) ? artifacts : []
    const artifactMap = new Map(buildArtifactsList.value.map((a) => [a.id, a]))
    const withArtifact = (item) => ({ ...item, artifact: artifactMap.get(item.build_artifact_id) })
    
    if (currentView.value === 'impl' && selectedArtifactId.value) {
      const elementToArtifacts = await listElementToArtifacts(versionId, { build_artifact_id: selectedArtifactId.value }).catch(() => [])
      elementToArtifactsList.value = Array.isArray(elementToArtifacts) ? elementToArtifacts.map(withArtifact) : []
      artifactRelationsList.value = Array.isArray(artifactRelations)
        ? artifactRelations.filter(
            (r) => r.input_artifact_id === selectedArtifactId.value || r.target_artifact_id === selectedArtifactId.value
          )
        : []
    } else if (currentView.value === 'logical' && selectedNode.value?.id) {
      const elementToArtifacts = await listElementToArtifacts(versionId, { element_id: selectedNode.value.id }).catch(() => [])
      elementToArtifactsList.value = Array.isArray(elementToArtifacts) ? elementToArtifacts.map(withArtifact) : []
      const relatedArtifactIds = new Set(elementToArtifactsList.value.map((e) => e.build_artifact_id))
      artifactRelationsList.value = Array.isArray(artifactRelations)
        ? artifactRelations.filter(
            (r) => relatedArtifactIds.has(r.input_artifact_id) || relatedArtifactIds.has(r.target_artifact_id)
          )
        : []
    } else {
      elementToArtifactsList.value = []
      artifactRelationsList.value = []
    }
  } catch (e) {
    console.error('加载构建关系失败:', e)
    elementToArtifactsList.value = []
    artifactRelationsList.value = []
    buildArtifactsList.value = []
  } finally {
    buildRelationsLoading.value = false
  }
}

function openAddElementToArtifactDialog() {
  if (currentView.value === 'impl') {
    if (!selectedArtifactId.value) {
      alert('请先选择左侧树中的构建产物')
      return
    }
    addElementToArtifactForm.value = {
      element_id: '',
      build_artifact_id: selectedArtifactId.value,
      build_order: 0,
      description: '',
    }
  } else {
    if (!selectedNodeId.value) {
      alert('请先选择左侧树中的架构元素')
      return
    }
    addElementToArtifactForm.value = {
      element_id: selectedNodeId.value,
      build_artifact_id: '',
      build_order: 0,
      description: '',
    }
  }
  showAddElementToArtifactDialog.value = true
  const versionId = selectedVersionId.value
  if (versionId && !buildArtifactsList.value.length) {
    listBuildArtifacts(versionId).then((list) => { buildArtifactsList.value = list || [] }).catch(() => { buildArtifactsList.value = [] })
  }
  if (!buildArtifactTypes.value.length) {
    getBuildArtifactTypes().then((types) => { buildArtifactTypes.value = Array.isArray(types) ? types : [] }).catch(() => { buildArtifactTypes.value = [] })
  }
}

async function submitAddElementToArtifact() {
  const versionId = selectedVersionId.value
  if (!versionId) return
  
  let elementId = null
  let artifactId = null
  
  if (currentView.value === 'impl') {
    elementId = addElementToArtifactForm.value.element_id
    artifactId = addElementToArtifactForm.value.build_artifact_id || selectedArtifactId.value
    if (!elementId) {
      alert('请选择架构元素')
      return
    }
    if (!artifactId) {
      alert('请先选择左侧树中的构建产物')
      return
    }
  } else {
    elementId = addElementToArtifactForm.value.element_id || selectedNodeId.value
    artifactId = addElementToArtifactForm.value.build_artifact_id
    if (!elementId) {
      alert('请先选择左侧树中的架构元素')
      return
    }
    if (!artifactId) {
      alert('请选择构建产物')
      return
    }
  }
  
  try {
    await createElementToArtifact({
      version_id: versionId,
      element_id: elementId,
      build_artifact_id: artifactId,
      build_order: addElementToArtifactForm.value.build_order || 0,
      description: addElementToArtifactForm.value.description?.trim() || undefined,
    })
    showAddElementToArtifactDialog.value = false
    await loadBuildRelations()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '添加失败')
  }
}

async function removeElementToArtifact(elementArtifactId) {
  if (!window.confirm('确定移除该映射关系？')) return
  try {
    await deleteElementToArtifact(elementArtifactId)
    await loadBuildRelations()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '删除失败')
  }
}

function openAddArtifactToArtifactDialog() {
  if (currentView.value === 'impl' && selectedArtifactId.value) {
    addArtifactToArtifactForm.value = {
      input_artifact_id: '',
      target_artifact_id: selectedArtifactId.value,
      build_order: 0,
      description: '',
    }
  } else {
    addArtifactToArtifactForm.value = {
      input_artifact_id: '',
      target_artifact_id: '',
      build_order: 0,
      description: '',
    }
  }
  showAddArtifactToArtifactDialog.value = true
  const versionId = selectedVersionId.value
  if (versionId && !buildArtifactsList.value.length) {
    listBuildArtifacts(versionId).then((list) => { buildArtifactsList.value = list || [] }).catch(() => { buildArtifactsList.value = [] })
  }
}

async function submitAddArtifactToArtifact() {
  const versionId = selectedVersionId.value
  if (!versionId) return
  const inputArtifactId = addArtifactToArtifactForm.value.input_artifact_id
  const targetArtifactId = addArtifactToArtifactForm.value.target_artifact_id || (currentView.value === 'impl' ? selectedArtifactId.value : '')
  if (!inputArtifactId || !targetArtifactId) {
    alert('请选择输入构建产物和目标构建产物')
    return
  }
  if (inputArtifactId === targetArtifactId) {
    alert('输入构建产物和目标构建产物不能相同')
    return
  }
  try {
    await createArtifactToArtifact({
      version_id: versionId,
      input_artifact_id: inputArtifactId,
      target_artifact_id: targetArtifactId,
      build_order: addArtifactToArtifactForm.value.build_order || 0,
      description: addArtifactToArtifactForm.value.description?.trim() || undefined,
    })
    showAddArtifactToArtifactDialog.value = false
    await loadBuildRelations()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '添加失败')
  }
}

async function removeArtifactToArtifact(artifactToArtifactId) {
  if (!window.confirm('确定删除该构建产物关系？')) return
  try {
    await deleteArtifactToArtifact(artifactToArtifactId)
    await loadBuildRelations()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '删除失败')
  }
}

async function loadDeploymentRelations() {
  const versionId = selectedVersionId.value
  if (!versionId) {
    artifactToDeploymentsList.value = []
    return
  }
  deploymentRelationsLoading.value = true
  try {
    const [artifacts, mappings] = await Promise.all([
      listBuildArtifacts(versionId).catch(() => []),
      listArtifactToDeployments(versionId, currentView.value === 'deploy' && selectedDeploymentUnitId.value ? { deployment_unit_id: selectedDeploymentUnitId.value } : {}).catch(() => []),
    ])
    buildArtifactsList.value = Array.isArray(artifacts) ? artifacts : []
    artifactToDeploymentsList.value = Array.isArray(mappings) ? mappings : []
  } catch (e) {
    console.error('加载部署关系失败:', e)
    artifactToDeploymentsList.value = []
  } finally {
    deploymentRelationsLoading.value = false
  }
}

function openAddArtifactToDeploymentDialog() {
  if (!selectedDeploymentUnitId.value) {
    alert('请先选择左侧树中的部署单元')
    return
  }
  addArtifactToDeploymentForm.value = {
    build_artifact_id: '',
    deployment_config: '',
    description: '',
  }
  showAddArtifactToDeploymentDialog.value = true
  const versionId = selectedVersionId.value
  if (versionId && !buildArtifactsList.value.length) {
    listBuildArtifacts(versionId).then((list) => { buildArtifactsList.value = list || [] }).catch(() => { buildArtifactsList.value = [] })
  }
}

async function submitAddArtifactToDeployment() {
  const versionId = selectedVersionId.value
  if (!versionId) return
  if (!selectedDeploymentUnitId.value) {
    alert('请先选择左侧树中的部署单元')
    return
  }
  if (!addArtifactToDeploymentForm.value.build_artifact_id) {
    alert('请选择构建产物')
    return
  }
  try {
    await createArtifactToDeployment({
      version_id: versionId,
      build_artifact_id: addArtifactToDeploymentForm.value.build_artifact_id,
      deployment_unit_id: selectedDeploymentUnitId.value,
      deployment_config: addArtifactToDeploymentForm.value.deployment_config?.trim() || undefined,
      description: addArtifactToDeploymentForm.value.description?.trim() || undefined,
    })
    showAddArtifactToDeploymentDialog.value = false
    await loadDeploymentRelations()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '添加失败')
  }
}

async function removeArtifactToDeployment(artifactDeployId) {
  if (!window.confirm('确定删除该构建产物映射？')) return
  try {
    await deleteArtifactToDeployment(artifactDeployId)
    await loadDeploymentRelations()
  } catch (e) {
    alert(e?.data?.detail ?? e?.message ?? '删除失败')
  }
}

function requireLoginAndVersion() {
  if (!hasVersion.value) {
    alert('请先选择一个产品版本')
    return false
  }
  if (!isProductLoggedIn()) {
    alert('请先登录')
    return false
  }
  return true
}

async function handleAdd() {
  if (!requireLoginAndVersion()) return
  if (currentView.value === 'impl') {
    artifactDraft.value = {
      name: '',
      artifact_type: '',
      build_command: '',
      build_environment: '',
      description: '',
    }
    selectedArtifactId.value = ''
    detailTab.value = 'basic'
    try {
      const types = await getBuildArtifactTypes()
      buildArtifactTypes.value = Array.isArray(types) ? types : []
    } catch (e) {
      console.error('加载构建产物类型失败:', e)
      buildArtifactTypes.value = []
    }
  } else if (currentView.value === 'deploy') {
    deploymentUnitDraft.value = {
      name: '',
      parent_unit_id: '',
      unit_type: '',
      description: '',
      deployment_config: '',
    }
    selectedDeploymentUnitId.value = ''
    detailTab.value = 'basic'
    try {
      const types = await getDeploymentUnitTypes()
      deploymentUnitTypes.value = Array.isArray(types) ? types : []
    } catch (e) {
      console.error('加载部署单元类型失败:', e)
      deploymentUnitTypes.value = []
    }
  } else {
    try {
      await addNode(selectedNodeId.value || '')
    } catch (e) {
      alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '新增失败'))
    }
  }
}

async function handleDeleteNode() {
  if (!requireLoginAndVersion()) return
  if (currentView.value === 'impl') {
    if (!selectedArtifactId.value) return
    if (!window.confirm('确定删除该构建产物？')) return
    try {
      await deleteBuildArtifact(selectedArtifactId.value)
      await loadBuildArtifactsTree()
      selectedArtifactId.value = ''
    } catch (e) {
      alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '删除失败'))
    }
  } else if (currentView.value === 'deploy') {
    if (!selectedDeploymentUnitId.value) return
    if (!window.confirm('确定删除该部署单元及其所有子单元？')) return
    try {
      await deleteDeploymentUnit(selectedDeploymentUnitId.value)
      await loadDeploymentUnitsTree()
      selectedDeploymentUnitId.value = ''
    } catch (e) {
      alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '删除失败'))
    }
  } else {
    if (!selectedNodeId.value) return
    if (!window.confirm('确定删除该节点及其所有子节点？')) return
    try {
      await deleteNode(selectedNodeId.value)
    } catch (e) {
      alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '删除失败'))
    }
  }
}

watch(selectedArtifactId, async (artifactId) => {
  if (!artifactId) {
    artifactDraft.value = {
      name: '',
      artifact_type: '',
      build_command: '',
      build_environment: '',
      description: '',
    }
    return
  }
  if (!buildArtifactTypes.value.length) {
    try {
      const types = await getBuildArtifactTypes()
      buildArtifactTypes.value = Array.isArray(types) ? types : []
    } catch (e) {
      console.error('加载构建产物类型失败:', e)
      buildArtifactTypes.value = []
    }
  }
  if (!buildArtifactTypes.value.length) {
    try {
      const types = await getBuildArtifactTypes()
      buildArtifactTypes.value = Array.isArray(types) ? types : []
    } catch (e) {
      console.error('加载构建产物类型失败:', e)
      buildArtifactTypes.value = []
    }
  }
  const item = buildArtifactsTreeFlat.value.find((i) => i.artifact.id === artifactId)
  if (item?.artifact) {
    const artifact = item.artifact
    artifactDraft.value = {
      name: artifact.name || '',
      artifact_type: artifact.artifact_type || '',
      build_command: artifact.build_command || '',
      build_environment: artifact.build_environment || '',
      description: artifact.description || '',
    }
    await loadBuildRelations()
  }
})

async function handleSaveArtifact() {
  if (!requireLoginAndVersion()) return
  const versionId = selectedVersionId.value
  if (!versionId) return
  const name = artifactDraft.value.name?.trim()
  if (!name) {
    alert('请输入构建产物名称')
    return
  }
  if (!artifactDraft.value.artifact_type) {
    alert('请选择产物类型')
    return
  }
  try {
    if (selectedArtifactId.value) {
      await updateBuildArtifact(versionId, selectedArtifactId.value, artifactDraft.value)
    } else {
      const artifact = await createBuildArtifact({
        version_id: versionId,
        ...artifactDraft.value,
      })
      selectedArtifactId.value = artifact.id
    }
    await loadBuildArtifactsTree()
  } catch (e) {
    alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '保存失败'))
  }
}

async function handleSaveDeploymentUnit() {
  if (!requireLoginAndVersion()) return
  const versionId = selectedVersionId.value
  if (!versionId) return
  const name = deploymentUnitDraft.value.name?.trim()
  if (!name) {
    alert('请输入部署单元名称')
    return
  }
  if (!deploymentUnitDraft.value.unit_type) {
    alert('请选择单元类型')
    return
  }
  try {
    if (selectedDeploymentUnitId.value) {
      await updateDeploymentUnit(versionId, selectedDeploymentUnitId.value, deploymentUnitDraft.value)
    } else {
      const unit = await createDeploymentUnit({
        version_id: versionId,
        ...deploymentUnitDraft.value,
      })
      selectedDeploymentUnitId.value = unit.id
    }
    await loadDeploymentUnitsTree()
  } catch (e) {
    alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '保存失败'))
  }
}

async function handleSaveNode() {
  if (!requireLoginAndVersion()) return
  if (!selectedNodeId.value) return
  const name = nodeDraft.value.name?.trim()
  if (!name) {
    alert('请输入节点名称')
    return
  }
  try {
    await updateNode(selectedNodeId.value, {
      name,
      parentId: nodeDraft.value.parentId ?? '',
      type: nodeDraft.value.type,
      code: nodeDraft.value.code || '',
      codeRepoUrl: nodeDraft.value.codeRepoUrl || '',
      codeRepoPath: nodeDraft.value.codeRepoPath || '',
      description: nodeDraft.value.description || '',
      contentMd: nodeDraft.value.contentMd || '',
      techStack: nodeDraft.value.techStack || '',
      qualityAttributes: nodeDraft.value.qualityAttributes || '',
      constraints: nodeDraft.value.constraints || '',
      specifications: nodeDraft.value.specifications || '',
    })
  } catch (e) {
    alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '保存失败'))
  }
}

async function handleGenerateDoc() {
  if (!requireLoginAndVersion()) return
  try {
    await fetchDoc()
  } catch (e) {
    alert(isProductNeedLoginError(e) ? '请先登录' : (e?.data?.detail ?? e?.message ?? '生成文档失败'))
  }
}

function getTypeLabel(t) {
  return NODE_TYPES.find((x) => x.id === t)?.label ?? '组件'
}

function formatTreeNodeName(typeLabel, name) {
  if (!name) return ''
  return typeLabel ? `[${typeLabel}]${name}` : name
}

function getTypeIcon(t) {
  return NODE_TYPES.find((x) => x.id === t)?.icon ?? '📦'
}
</script>

<style scoped>
.architecture-manage-tab { display: flex; flex-direction: column; flex: 1; min-height: 0; }

.btn { padding: 6px 12px; font-size: 13px; border-radius: 6px; cursor: pointer; border: none; }
.btn.primary { color: #fff; background: #1a73e8; }
.btn.primary:hover:not(:disabled) { background: #1765cc; }
.btn.secondary { color: #202124; background: #f1f3f4; }
.btn.secondary:hover:not(:disabled) { background: #e8eaed; }
.btn.danger { color: #fff; background: #d93025; }
.btn.danger:hover:not(:disabled) { background: #b71c1c; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.empty-state {
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  color: #9aa0a6;
  font-size: 14px;
  text-align: center;
}

.panels {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 12px;
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
.panel-left { width: 22%; min-width: 240px; max-width: 320px; }
.panel-center { width: 38%; min-width: 360px; max-width: 640px; }
.panel-right { flex: 1; min-width: 0; }
.panel-header { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 16px; border-bottom: 1px solid #e8eaed; flex-shrink: 0; }
.panel-title { font-size: 13px; font-weight: 500; color: #5f6368; }
.panel-body { flex: 1; min-height: 0; overflow: auto; }
.placeholder { padding: 16px; font-size: 14px; color: #9aa0a6; }

.panel-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.panel-left .panel-header .panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}
.panel-left .panel-header .btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  background: #111;
  color: #fff;
}
.panel-left .panel-header .btn:hover:not(:disabled) { background: #000; }
.panel-left .panel-header .btn.primary { color: #fff; background: #111; }
.panel-left .panel-header .btn.primary:hover:not(:disabled) { background: #000; }
.panel-left .panel-header .btn.danger { color: #fff; background: #111; }
.panel-left .panel-header .btn.danger:hover:not(:disabled) { background: #000; }
.panel-left .panel-header .btn:disabled { opacity: 0.6; cursor: not-allowed; }
.view-select-wrap { position: relative; }
.view-select-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: #202124;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 6px;
  cursor: pointer;
}
.view-select-btn:hover { background: #f8f9fa; border-color: #c4c7c5; }
.view-select-arrow { flex-shrink: 0; color: #5f6368; }
.view-select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  min-width: 100%;
  padding: 4px 0;
  background: #fff;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.view-select-option {
  display: block;
  width: 100%;
  padding: 6px 12px;
  font-size: 13px;
  color: #202124;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  line-height: 1.35;
}
.view-select-option:hover { background: #f1f3f4; }
.view-select-option.active { background: #e8f0fe; color: #1a73e8; }

.tree { padding: 8px 0; }
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #202124;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.tree-node:hover { background: #f1f3f4; }
.tree-node.active { background: #e8f0fe; color: #1a73e8; }
.node-icon { width: 18px; text-align: center; flex-shrink: 0; }
.node-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.node-type { font-size: 12px; color: #5f6368; flex-shrink: 0; }
.tree-node.active .node-type { color: #1a73e8; }

.detail-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid #e8eaed;
  flex-shrink: 0;
}
.detail-tab {
  padding: 10px 16px;
  font-size: 13px;
  color: #5f6368;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
}
.detail-tab:hover { color: #202124; }
.detail-tab.active {
  color: #1a73e8;
  font-weight: 500;
  border-bottom-color: #1a73e8;
}
.detail-form { padding: 16px; }
.interface-info { padding: 16px; }
.interface-loading { font-size: 13px; color: #5f6368; padding: 12px 0; }
.interface-section { margin-bottom: 20px; }
.interface-section:last-child { margin-bottom: 0; }
.interface-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}
.interface-section-head .btn-add-provides,
.interface-section-head .btn-add-uses {
  cursor: pointer;
}
.interface-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #202124;
}
.interface-empty {
  font-size: 13px;
  color: #9aa0a6;
  padding: 8px 0;
}
.interface-list { list-style: none; padding: 0; margin: 0; }
.interface-item {
  padding: 10px 12px;
  font-size: 13px;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  margin-bottom: 8px;
}

.interface-item-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.interface-tree-prefix { color: #9aa0a6; font-size: 12px; margin-right: 2px; }
.interface-name { font-weight: 500; color: #202124; }
.interface-code { font-family: ui-monospace, monospace; font-size: 12px; color: #5f6368; }
.interface-meta { font-size: 12px; color: #5f6368; }
.interface-type { font-size: 12px; color: #5f6368; }
.interface-providers { font-size: 12px; color: #1a73e8; font-weight: 500; }
.interface-rel-desc { font-size: 12px; color: #5f6368; }
.interface-item .btn-expand {
  padding: 4px 10px;
  font-size: 12px;
  color: #1a73e8;
  background: #e8f0fe;
  border: 1px solid #1a73e8;
  border-radius: 6px;
  cursor: pointer;
}
.interface-item .btn-expand:hover { background: #d2e3fc; }
.interface-item .btn-remove {
  margin-left: auto;
  padding: 4px 10px;
  font-size: 12px;
  color: #5f6368;
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 6px;
  cursor: pointer;
}
.interface-item .btn-remove:hover { background: #ea4335; color: #fff; border-color: #ea4335; }

.interface-item-detail {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8eaed;
}
.interface-detail-row {
  margin-bottom: 10px;
  font-size: 13px;
}
.interface-detail-row .detail-label {
  display: inline-block;
  min-width: 100px;
  color: #5f6368;
  margin-right: 8px;
  vertical-align: top;
}
.interface-detail-row .detail-value {
  color: #202124;
  word-break: break-word;
}
.interface-detail-row.field-md .field-md-header { margin-bottom: 6px; }
.interface-detail-row.field-md .detail-label { min-width: auto; }
.md-preview.small {
  min-height: 40px;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 6px;
}
.interface-md-src {
  margin: 0;
  padding: 8px 10px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
  background: #f8f9fa;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}
.interface-method {
  font-size: 11px;
  padding: 2px 6px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 4px;
}
.interface-path { font-family: ui-monospace, monospace; font-size: 12px; color: #5f6368; }
.interface-desc { width: 100%; font-size: 12px; color: #5f6368; margin-top: 2px; }
.add-relation-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.add-relation-dialog {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.create-interface-dialog {
  width: 560px;
  min-width: 480px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
}
.add-relation-title { font-size: 16px; font-weight: 500; margin-bottom: 16px; color: #202124; }
.add-relation-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.add-relation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.field { margin-bottom: 14px; }
.field label { display: block; margin-bottom: 6px; font-size: 14px; color: #202124; }
.field input, .field textarea, .field select {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
}
.field textarea { resize: vertical; min-height: 72px; }
.textarea-md-field { min-height: 100px; resize: vertical; }
.textarea-md { min-height: 240px; height: 240px; }
.field-md-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.field-md-header label { margin-bottom: 0; }
.btn-md-toggle {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 12px;
  color: #5f6368;
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 6px;
  cursor: pointer;
}
.btn-md-toggle:hover {
  background: #e8eaed;
  color: #202124;
}
.md-preview {
  min-height: 100px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #202124;
  background: #f8f9fa;
  border: 1px solid #dadce0;
  border-radius: 6px;
  box-sizing: border-box;
  overflow: auto;
}
.md-preview :deep(h1) { font-size: 1.25em; margin: 0 0 0.5em; }
.md-preview :deep(h2) { font-size: 1.1em; margin: 0.75em 0 0.35em; }
.md-preview :deep(h3) { font-size: 1em; margin: 0.5em 0 0.25em; }
.md-preview :deep(p) { margin: 0 0 0.5em; }
.md-preview :deep(ul), .md-preview :deep(ol) { margin: 0 0 0.5em; padding-left: 1.5em; }
.md-preview :deep(code) { background: #e8eaed; padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.9em; }
.md-preview :deep(pre) { background: #e8eaed; padding: 10px; border-radius: 6px; overflow: auto; margin: 0 0 0.5em; }
.md-preview :deep(pre code) { background: none; padding: 0; }
.md-empty { color: #9aa0a6; margin: 0; }
.md-preview-lg { min-height: 240px; }
.form-actions { margin-top: 8px; display: flex; justify-content: flex-end; gap: 10px; }
.detail-form .form-actions .btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  background: #111;
  color: #fff;
}
.detail-form .form-actions .btn:hover:not(:disabled) {
  background: #000;
}
.detail-form .form-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.panel-header-doc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.panel-header-doc .btn-md-toggle {
  flex-shrink: 0;
}
.doc { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.doc-textarea {
  width: 100%;
  flex: 1;
  min-height: 360px;
  height: 360px;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-sizing: border-box;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
.md-preview-doc {
  flex: 1;
  min-height: 360px;
  overflow: auto;
}
.doc-actions { justify-content: flex-end; }
</style>
