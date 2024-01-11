package no.gata.web

import no.gata.web.exception.ExternalUserNotFound
import no.gata.web.exception.GataUserNoSufficientRole
import no.gata.web.exception.GataUserNotFound
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

data class ErrorResponse(val message: String?)

@ControllerAdvice
class ControllerAdvisor : ResponseEntityExceptionHandler() {
    @ExceptionHandler(value = [GataUserNotFound::class, ExternalUserNotFound::class])
    protected fun handleNotFound(
        ex: RuntimeException,
        request: WebRequest,
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity(ErrorResponse(ex.message), HttpStatus.NOT_FOUND)
    }

    @ExceptionHandler(value = [GataUserNoSufficientRole::class])
    protected fun handleNoSuffiecientRoles(
        ex: RuntimeException,
        request: WebRequest,
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity(ErrorResponse(ex.message), HttpStatus.BAD_REQUEST)
    }

    @ExceptionHandler(value = [ResponseStatusException::class])
    protected fun handleResponseStatusException(
        ex: ResponseStatusException,
        request: WebRequest,
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity(ErrorResponse(ex.message), ex.statusCode)
    }

    @ExceptionHandler(RuntimeException::class)
    fun handleAllUncaughtException(
        exception: RuntimeException,
        request: WebRequest,
    ): ResponseEntity<ErrorResponse> {
        logger.error(exception)
        logger.info(exception.stackTrace)
        logger.error("Application error in: [" + exception.javaClass.name + "]", exception)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ErrorResponse(exception.message))
    }
}
