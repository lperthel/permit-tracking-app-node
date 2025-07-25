package com.permittrack.permitapi.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "permits") // plural is the default JPA style; match it to what you want
public class PermitEntity {

    @Id
    @GeneratedValue
    @JdbcTypeCode(SqlTypes.VARCHAR) // H2 does not have type UUID
    private UUID id;

    private String permitName;
    private String applicantName;
    private String permitType;
    private String status;
    private LocalDateTime submittedDate;

}
