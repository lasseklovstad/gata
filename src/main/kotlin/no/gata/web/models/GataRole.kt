package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.ManyToMany
import java.util.UUID

enum class UserRoleName {
    Member,
    Admin,
}

@Entity
class GataRole(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    var name: String,
    var roleName: UserRoleName,
    @ManyToMany(mappedBy = "roles")
    @JsonIgnore
    var users: List<GataUser> = emptyList(),
)
