package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.participant.model.Participant;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class ParticipantRepository {
    private final JdbcTemplate jdbc;

    public ParticipantRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Participant> MAPPER = (rs, rowNum) ->
            new Participant(
                    rs.getLong("id"),
                    rs.getString("name"),
                    rs.getString("phone_hash"),
                    rs.getString("phone_last4"),
                    rs.getString("created_at")
            );

    public void insert(String name, String phoneHash, String phoneLast4) {
        String now = OffsetDateTime.now().toString();
        jdbc.update(
                "INSERT INTO participants(name, phone_hash, phone_last4, created_at) VALUES(?,?,?,?)",
                name, phoneHash, phoneLast4, now
        );
    }

    public Optional<Participant> findByNameAndPhoneHash(String name, String phoneHash) {
        List<Participant> list = jdbc.query(
                "SELECT * FROM participants WHERE name = ? AND phone_hash = ? LIMIT 1",
                MAPPER,
                name, phoneHash
        );
        return list.stream().findFirst();
    }

    public Optional<Participant> findById(long id) {
        List<Participant> list = jdbc.query(
                "SELECT * FROM participants WHERE id = ? LIMIT 1",
                MAPPER,
                id
        );
        return list.stream().findFirst();
    }

    public List<Participant> searchByNamePrefix(String q, int limit) {
        String like = q.trim() + "%";
        return jdbc.query(
                "SELECT id, name, phone_hash, phone_last4, created_at FROM participants " +
                        "WHERE name LIKE ? ORDER BY name LIMIT ?",
                MAPPER,
                like, limit
        );
    }

    public int countAll() {
        Integer n = jdbc.queryForObject("SELECT COUNT(*) FROM participants", Integer.class);
        return n == null ? 0 : n;
    }

    public void deleteAll() {
        jdbc.update("DELETE FROM participants");
    }
}
