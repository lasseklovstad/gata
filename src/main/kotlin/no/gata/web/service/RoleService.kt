package no.gata.web.service

import no.gata.web.exception.GataRoleNotFound
import no.gata.web.models.GataRole
import no.gata.web.models.GataUser
import no.gata.web.models.UserRoleName
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class RoleService {

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository

    @Autowired
    private lateinit var gataRoleRepository: GataRoleRepository


    fun seedRoles() {
        if (!gataRoleRepository.findAll().any()) {
            gataRoleRepository.saveAll(
                listOf(
                    GataRole(
                        id = null,
                        roleName = UserRoleName.Admin,
                        name = "Administrator"
                    ), GataRole(
                        id = null,
                        roleName = UserRoleName.Member,
                        name = "Medlem"
                    )
                )
            )
        }
    }

    fun addRoles(gataUser: GataUser, roles: Set<GataRole>) {
        gataUser.roles = gataUser.roles.plus(roles)
        gataUserRepository.save(gataUser)
    }

    fun deleteRoles(gataUser: GataUser, roles: Set<GataRole>) {
        gataUser.roles = gataUser.roles.minus(roles)
        gataUserRepository.save(gataUser)
    }

    fun deleteAllRoles(gataUser: GataUser){
        gataUser.roles = emptyList<GataRole>().toMutableList()
        gataUserRepository.save(gataUser)
    }

    fun getRole(roleName: UserRoleName): GataRole{
        return gataRoleRepository.findByRoleName(roleName)
            .orElseThrow { GataRoleNotFound(roleName) }
    }

    fun getAdminRole(): GataRole {
        return getRole(UserRoleName.Admin)
    }

    fun getMemberRole(): GataRole {
        return getRole(UserRoleName.Member)
    }
}
