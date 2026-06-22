import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, Button, Popconfirm } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'

export default function AccessPointCard({ id, accessPoint, onDelete }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id, data: { type: 'access-point', accessPoint } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 8,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        bodyStyle={{ padding: '8px 12px' }}
        extra={
          <Popconfirm title="确定删除？" onConfirm={(e) => { e?.stopPropagation(); onDelete(id) }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        }
      >
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{accessPoint.name}</div>
        {accessPoint.address && (
          <div style={{ color: '#999', fontSize: 12 }}>{accessPoint.address}</div>
        )}
      </Card>
    </div>
  )
}
