import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, message, Spin } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  getProject, getAccessPoints,
  createStage, deleteStage,
  deleteAccessPoint, moveAccessPoint,
} from '../api'
import KanbanColumn from './components/KanbanColumn'
import AccessPointCard from './components/AccessPointCard'
import ImportModal from './components/ImportModal'

export default function KanbanBoard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const projectId = parseInt(id)

  const [project, setProject] = useState(null)
  const [stages, setStages] = useState([])
  const [allCards, setAllCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [proj, cards] = await Promise.all([
        getProject(projectId),
        getAccessPoints(projectId),
      ])
      setProject(proj)
      setStages(proj.stages || [])
      setAllCards(cards)
    } catch (e) {
      message.error('加载失败')
    }
    setLoading(false)
  }, [projectId])

  useEffect(() => { load() }, [load])

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 100 }}><Spin size="large" /></div>
  }
  if (!project) {
    return <div style={{ textAlign: 'center', paddingTop: 100 }}>项目不存在</div>
  }

  // 按 stage_id 分组卡片
  const cardsByStage = {}
  const unassigned = []
  allCards.forEach(card => {
    if (card.stage_id && stages.some(s => s.id === card.stage_id)) {
      if (!cardsByStage[card.stage_id]) cardsByStage[card.stage_id] = []
      cardsByStage[card.stage_id].push(card)
    } else {
      unassigned.push(card)
    }
  })

  const handleDragStart = (event) => {
    const { active } = event
    if (active.data.current?.type === 'access-point') {
      setActiveCard(active.data.current.accessPoint)
    }
  }

  const handleDragEnd = async (event) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const cardId = active.id
    const card = allCards.find(c => c.id === cardId)
    if (!card) return

    // 拖到哪个列
    let targetStageId = null
    if (over.data.current?.type === 'stage') {
      targetStageId = over.data.current.stage.id
    } else if (over.data.current?.type === 'access-point') {
      targetStageId = over.data.current.accessPoint.stage_id
    }

    if (targetStageId === card.stage_id) {
      // 同列排序
      const colCards = cardsByStage[card.stage_id] || []
      const oldIdx = colCards.findIndex(c => c.id === cardId)
      const newIdx = colCards.findIndex(c => c.id === over.id)
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const reordered = arrayMove(colCards, oldIdx, newIdx)
        const newAll = allCards.map(c => {
          const found = reordered.find(r => r.id === c.id)
          return found ? { ...c, sort_order: reordered.indexOf(found) } : c
        })
        setAllCards(newAll)
        try { await moveAccessPoint(cardId, { stage_id: card.stage_id, sort_order: newIdx }) } catch (e) {}
      }
      return
    }

    // 跨列移动
    const targetCards = targetStageId ? (cardsByStage[targetStageId] || []) : unassigned
    const newSortOrder = targetCards.length
    try {
      await moveAccessPoint(cardId, {
        stage_id: targetStageId,
        sort_order: newSortOrder,
      })
      setAllCards(prev => prev.map(c =>
        c.id === cardId ? { ...c, stage_id: targetStageId, sort_order: newSortOrder } : c
      ))
    } catch (e) {
      message.error('移动失败')
    }
  }

  const handleAddStage = async () => {
    const name = prompt('请输入阶段名称：')
    if (!name) return
    try {
      await createStage(projectId, { name })
      message.success('阶段已添加')
      load()
    } catch (e) {
      message.error('添加失败')
    }
  }

  const handleDeleteStage = async (stageId) => {
    try {
      await deleteStage(stageId)
      load()
    } catch (e) {
      message.error('删除失败')
    }
  }

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteAccessPoint(cardId)
      setAllCards(prev => prev.filter(c => c.id !== cardId))
      message.success('已删除')
    } catch (e) {
      message.error('删除失败')
    }
  }

  const allStageIds = stages.map(s => `stage-${s.id}`)

  return (
    <div>
      {/* 工具栏 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, background: '#fff', padding: '12px 16px', borderRadius: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
          <h2 style={{ margin: 0 }}>{project.name}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
            导入 Excel
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStage}>
            添加阶段
          </Button>
        </div>
      </div>

      {/* 看板列 */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto',
          paddingBottom: 16, alignItems: 'flex-start',
        }}>
          {stages
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                cards={(cardsByStage[stage.id] || []).sort((a, b) => a.sort_order - b.sort_order)}
                onDeleteCard={handleDeleteCard}
                onDeleteStage={handleDeleteStage}
              />
            ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div style={{ width: 244 }}>
              <AccessPointCard
                id={activeCard.id}
                accessPoint={activeCard}
                onDelete={() => {}}
                isDragOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ImportModal
        projectId={projectId}
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => { setImportOpen(false); load() }}
      />
    </div>
  )
}
