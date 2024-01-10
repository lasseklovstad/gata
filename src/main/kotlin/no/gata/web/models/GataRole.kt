package no.gata.web.models

import com.fasterxml.jackson.annotation.JsonIgnore
import java.util.*
import jakarta.persistence.*

enum class UserRoleName {
    Member, Admin,
}

@Entity
class GataRole(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    var id: UUID? = null,
    @JsonIgnore
    var externalUserProviderId: String = "",
    var name: String,
    var roleName: UserRoleName,
    @ManyToMany(mappedBy = "roles")
    @JsonIgnore
    var users: List<GataUser> = emptyList()
)


