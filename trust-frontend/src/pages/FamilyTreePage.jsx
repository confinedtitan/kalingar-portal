import React from 'react';
import { styles } from '../utils/styles';

export default function FamilyTreePage({ members, t }) {
  return (
    <div style={styles.page}>
      <h2 style={styles.pageTitle}>{t.familyTree}</h2>

      <div style={styles.familyTreeContainer}>
        {members.map(member => {
          const fatherName = member.father_name ?? member.fatherName ?? '';
          const motherName = member.mother_name ?? member.motherName ?? '';
          const spouseName = member.spouse_name ?? member.spouseName ?? '';
          const children = member.children ?? [];

          return (
            <div key={member.id} style={styles.familyCard}>
              <div style={styles.familyCardHeader}>
                <h3 style={styles.familyCardTitle}>{member.name}</h3>
                <span style={styles.familyCardBadge}>{t.generation} 1</span>
              </div>

              <div style={styles.familyDetails}>
                <div style={styles.familyRow}>
                  <strong>{t.fatherName}:</strong> {fatherName}
                </div>
                {motherName && (
                  <div style={styles.familyRow}>
                    <strong>{t.motherName}:</strong> {motherName}
                  </div>
                )}
                {spouseName && (
                  <div style={styles.familyRow}>
                    <strong>{t.spouseName}:</strong> {spouseName}
                  </div>
                )}
              </div>

              {children.length > 0 && (
                <div style={styles.childrenContainer}>
                  <h4 style={styles.childrenTitle}>{t.children}</h4>
                  {children.map((child, index) => (
                    <div key={index} style={styles.childCard}>
                      <span style={styles.childIcon}>{child.gender === 'Male' ? '👦' : '👧'}</span>
                      <div>
                        <div style={styles.childName}>{child.name}</div>
                        <div style={styles.childMeta}>{child.date_of_birth ?? child.dob}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
