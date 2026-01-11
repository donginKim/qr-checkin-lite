package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.AttendanceRecord;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AttendanceRepository {

    private final JdbcTemplate jdbc;

    public AttendanceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public int insert(String sessionId, String sessionTitle, long participantId, String name, String phone, String phoneLast4, 
                      String checkedInAt, String ip, String userAgent) {
        return jdbc.update(
                "INSERT INTO attendances(session_id, session_title, participant_id, name, phone, phone_last4, checked_in_at, ip, user_agent) VALUES(?,?,?,?,?,?,?,?,?)",
                sessionId, sessionTitle, participantId, name, phone, phoneLast4, checkedInAt, ip, userAgent
        );
    }

    public List<AttendanceRecord> findAll() {
        return jdbc.query(
                "SELECT a.id, a.session_id, a.session_title, a.participant_id, a.name, a.phone, a.phone_last4, " +
                "COALESCE(p.district, '') as district, a.checked_in_at " +
                "FROM attendances a LEFT JOIN participants p ON a.participant_id = p.id " +
                "ORDER BY a.checked_in_at DESC",
                (rs, rowNum) -> new AttendanceRecord(
                        rs.getLong("id"),
                        rs.getString("session_id"),
                        rs.getString("session_title"),
                        rs.getLong("participant_id"),
                        rs.getString("name"),
                        rs.getString("phone"),
                        rs.getString("phone_last4"),
                        rs.getString("district"),
                        rs.getString("checked_in_at")
                )
        );
    }

    public List<AttendanceRecord> findBySessionId(String sessionId) {
        return jdbc.query(
                "SELECT a.id, a.session_id, a.session_title, a.participant_id, a.name, a.phone, a.phone_last4, " +
                "COALESCE(p.district, '') as district, a.checked_in_at " +
                "FROM attendances a LEFT JOIN participants p ON a.participant_id = p.id " +
                "WHERE a.session_id = ? ORDER BY a.checked_in_at DESC",
                (rs, rowNum) -> new AttendanceRecord(
                        rs.getLong("id"),
                        rs.getString("session_id"),
                        rs.getString("session_title"),
                        rs.getLong("participant_id"),
                        rs.getString("name"),
                        rs.getString("phone"),
                        rs.getString("phone_last4"),
                        rs.getString("district"),
                        rs.getString("checked_in_at")
                ),
                sessionId
        );
    }

    public int countBySessionId(String sessionId) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM attendances WHERE session_id = ?",
                Integer.class,
                sessionId
        );
    }

    public int deleteOlderThan(String cutoffDate) {
        return jdbc.update(
                "DELETE FROM attendances WHERE checked_in_at < ?",
                cutoffDate
        );
    }

    public int deleteByDateRange(String startDate, String endDate) {
        return jdbc.update(
                "DELETE FROM attendances WHERE checked_in_at >= ? AND checked_in_at < ?",
                startDate, endDate
        );
    }

    public int deleteBySessionId(String sessionId) {
        return jdbc.update(
                "DELETE FROM attendances WHERE session_id = ?",
                sessionId
        );
    }
}