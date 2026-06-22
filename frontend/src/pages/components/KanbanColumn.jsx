import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import AccessPointCard from './AccessPointCard'

export default function KanbanColumn({ stage, cards, onDeleteCard, onDeleteStage }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: 'stage', stage },
  })

  const isBottleneck = stage.is_bottleneck === 1

  return (
    <div style={{
      minWidth: 260, width: 260, flexShrink: 0,
      background: isOver ? '#f0f5ff' : '#fafafa',
      borderRadius: 8, padding: 12,
      border: isOver ? `2px dashed ${stage.color}` : isBottleneck ? '2px solid #ff4d4f' : '1px solid #e8e8e8',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 180px)',
      transition: 'background 0.2s, border 0.2s',
    }}>
      {/* 列头 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12, paddingBottom: 8,
        borderBottom: `2px solid ${stage.color}`,
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            width: 10, height: 10, borderRadius: '50%',
            background: stage.color, marginRight: 8,
          }} />
          <span style={{ fontWeight: 'bold', fontSize: 14 }}>{stage.name}</span>
          <span style={{
            marginLeft: 8, background: '#e8e8e8', borderRadius: 10,
            padding: '0 8px', fontSize: 12, color: '#666',
          }}>
            {cards.length}
          </span>
        </div>
        <Popconfirm title="确定删除此阶段？该列的接入点将移至未分类。" onConfirm={() => onDeleteStage(stage.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </div>

      {/* 卡片区 */}
      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} style={{ flex: 1, overflowY: 'auto', minHeight: 60 }}>
          {cards.map(card => (
            <AccessPointCard key={card.id} id={card.id} accessPoint={card} onDelete={onDeleteCard} />
          ))}
          {cards.length === 0 && (
            <div style={{
              textAlign: 'center', color: '#ccc', fontSize: 12,
              padding: '20px 0',
            }}>
              拖拽卡片到此处
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
