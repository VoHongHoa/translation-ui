import React, { useMemo } from 'react';
import { Card, Checkbox, Space, Tag, Typography, Spin } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { RoleGroupEntity } from '../../types/roleGroup';

const { Text } = Typography;

interface RoleGroupSelectorProps {
  availableRoleGroups: RoleGroupEntity[];
  selectedRoleGroupIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  loading?: boolean;
  disabled?: boolean;
}

export const RoleGroupSelector: React.FC<RoleGroupSelectorProps> = ({
  availableRoleGroups,
  selectedRoleGroupIds,
  onSelectionChange,
  loading = false,
  disabled = false,
}) => {
  const handleRoleGroupToggle = (roleGroupId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRoleGroupIds, roleGroupId]);
    } else {
      onSelectionChange(selectedRoleGroupIds.filter((id) => id !== roleGroupId));
    }
  };

  const selectedRoleGroups = useMemo(() => {
    return availableRoleGroups.filter((rg) => selectedRoleGroupIds.includes(rg.id));
  }, [availableRoleGroups, selectedRoleGroupIds]);

  if (loading) {
    return (
      <Card size="small" style={{ backgroundColor: '#fafafa', textAlign: 'center' }}>
        <Spin />
      </Card>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      {availableRoleGroups.length > 0 ? (
        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {availableRoleGroups.map((roleGroup) => (
              <div
                key={roleGroup.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  backgroundColor: selectedRoleGroupIds.includes(roleGroup.id) ? '#e6f7ff' : 'transparent',
                  border: selectedRoleGroupIds.includes(roleGroup.id) ? '1px solid #91d5ff' : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Checkbox
                    checked={selectedRoleGroupIds.includes(roleGroup.id)}
                    onChange={(e: CheckboxChangeEvent) => handleRoleGroupToggle(roleGroup.id, e.target.checked)}
                    disabled={disabled}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      <Tag color="geekblue">{roleGroup.code}</Tag>
                      <span>{roleGroup.name}</span>
                    </div>
                    {roleGroup.description && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {roleGroup.description}
                      </Text>
                    )}
                    {roleGroup.permissions && roleGroup.permissions.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {roleGroup.permissions.slice(0, 3).map((perm) => (
                          <Tag key={perm.id} color="green" style={{ fontSize: 11 }}>
                            {perm.code}
                          </Tag>
                        ))}
                        {roleGroup.permissions.length > 3 && (
                          <Tag color="default" style={{ fontSize: 11 }}>
                            +{roleGroup.permissions.length - 3}
                          </Tag>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
          <Text type="secondary">Không có nhóm vai trò nào để chọn</Text>
        </Card>
      )}

      {selectedRoleGroups.length > 0 && (
        <Card size="small" style={{ backgroundColor: '#f0f5ff' }}>
          <div style={{ fontSize: 12, marginBottom: 8, fontWeight: 500 }}>
            Đã chọn ({selectedRoleGroups.length}):
          </div>
          <Space wrap>
            {selectedRoleGroups.map((rg) => (
              <Tag key={rg.id} color="blue">
                {rg.name} ({rg.code})
              </Tag>
            ))}
          </Space>
        </Card>
      )}
    </Space>
  );
};
