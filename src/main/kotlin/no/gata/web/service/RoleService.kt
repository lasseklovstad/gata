package no.gata.web.service

import no.gata.web.controller.dtoOut.DtoOutGataUser
import no.gata.web.models.GataRole
import no.gata.web.models.GataUser
import no.gata.web.repository.GataRoleRepository
import no.gata.web.repository.GataUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class RoleService {

    @Autowired
    private lateinit var auth0RestService: Auth0RestService

    @Autowired
    private lateinit var roleRepository: GataRoleRepository

    @Autowired
    private lateinit var gataUserRepository: GataUserRepository



    fun addRoles(gataUser: GataUser, roles: Set<GataRole>): GataUser? {
        val roleIds = roles.map { it.externalUserProviderId }
        var updateOk = true
        gataUser.externalUserProviders.forEach {
            val response = auth0RestService.updateRole(it.id, roleIds, HttpMethod.POST);
            if (response?.statusCode != HttpStatus.NO_CONTENT) {
                updateOk = false
            }
        }
        if (updateOk) {
            gataUser.roles = gataUser.roles.plus(roles)
            return gataUserRepository.save(gataUser)
        }
        return null
    }

    fun deleteRoles(gataUser: GataUser, roles: Set<GataRole>): GataUser? {
        val roleIds = roles.map { it.externalUserProviderId }
        var updateOk = true
        gataUser.externalUserProviders.forEach {
            val response = auth0RestService.updateRole(it.id, roleIds, HttpMethod.DELETE);
            if (response?.statusCode != HttpStatus.NO_CONTENT) {
                updateOk = false
            }
        }
        if(updateOk){
            gataUser.roles = gataUser.roles.minus(roles)
            return gataUserRepository.save(gataUser)
        }
        return null
    }
}
