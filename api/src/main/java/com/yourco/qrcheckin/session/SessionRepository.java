package com.yourco.qrcheckin.session;

import com.yourco.qrcheckin.session.model.Session;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SessionRepository {

    private final JdbcTemplate jdbc;

    public SessionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Session> MAPPER = (rs, rowNum) ->
            new Session(
                    rs.getString("id"),
                    rs.getString("title"),
                    rs.getString("session_date"),
                    rs.getString("starts_at"),
                    rs.getString("ends_at"),
                    rs.getString("token_hash"),
                    rs.getString("short_code"),
                    rs.getString("status"),
                    rs.getString("created_at")
            );

    public void insert(Session session) {
        jdbc.update(
                "INSERT INTO sessions(id, title, session_date, starts_at, ends_at, token_hash, short_code, status, created_at) VALUES(?,?,?,?,?,?,?,?,?)",
                session.id(),
                session.title(),
                session.sessionDate(),
                session.startsAt(),
                session.endsAt(),
                session.tokenHash(),
                session.shortCode(),
                session.status(),
                session.createdAt()
        );
    }

    public Optional<Session> findByShortCode(String shortCode) {
        List<Session> list = jdbc.query(
                "SELECT * FROM sessions WHERE short_code = ? LIMIT 1",
                MAPPER,
                shortCode
        );
        return list.stream().findFirst();
    }

    public Optional<Session> findById(String id) {
        List<Session> list = jdbc.query(
                "SELECT * FROM sessions WHERE id = ? LIMIT 1",
                MAPPER,
                id
        );
        return list.stream().findFirst();
    }

    public Optional<Session> findByTokenHash(String tokenHash) {
        List<Session> list = jdbc.query(
                "SELECT * FROM sessions WHERE token_hash = ? LIMIT 1",
                MAPPER,
                tokenHash
        );
        return list.stream().findFirst();
    }

    public List<Session> findAll() {
        return jdbc.query(
                "SELECT * FROM sessions ORDER BY session_date DESC, created_at DESC",
                MAPPER
        );
    }

    public List<Session> findByDate(String date) {
        return jdbc.query(
                "SELECT * FROM sessions WHERE session_date = ? ORDER BY created_at DESC",
                MAPPER,
                date
        );
    }

    public void updateStatus(String id, String status) {
        jdbc.update("UPDATE sessions SET status = ? WHERE id = ?", status, id);
    }

    public void delete(String id) {
        jdbc.update("DELETE FROM sessions WHERE id = ?", id);
    }
}

