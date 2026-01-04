package com.yourco.qrcheckin.settings;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Repository
public class SettingsRepository {

    private final JdbcTemplate jdbc;

    public SettingsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<String> get(String key) {
        var list = jdbc.query(
                "SELECT value FROM settings WHERE key = ?",
                (rs, rowNum) -> rs.getString("value"),
                key
        );
        return list.stream().findFirst();
    }

    public void set(String key, String value) {
        jdbc.update(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                key, value
        );
    }

    public Map<String, String> getAll() {
        Map<String, String> result = new HashMap<>();
        jdbc.query(
                "SELECT key, value FROM settings",
                (rs) -> {
                    result.put(rs.getString("key"), rs.getString("value"));
                }
        );
        return result;
    }
}

