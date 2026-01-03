package com.yourco.qrcheckin.attendance;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AttendanceRepository {

    private final JdbcTemplate jdbc;

    public AttendanceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public int insert(String sessionId, long participantId, String checkedInAt, String ip, String userAgent) {
        return jdbc.update(
                "INSERT INTO attendances(session_id, participant_id, checked_in_at, ip, user_agent) VALUES(?,?,?,?,?)",
                sessionId, participantId, checkedInAt, ip, userAgent
        );
    }
}