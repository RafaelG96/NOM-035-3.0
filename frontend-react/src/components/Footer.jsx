function Footer() {
  return (
    <footer className="text-center mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Recursos oficiales</h5>
            <ul className="list-unstyled">
              <li><a href="https://www.gob.mx/stps" className="text-white" target="_blank" rel="noopener noreferrer">STPS</a></li>
              <li>
                <a 
                  href="https://www.dof.gob.mx/nota_detalle.php?codigo=5541828&fecha=23/10/2018" 
                  className="text-white" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Publicación en DOF
                </a>
              </li>
            </ul>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Contacto</h5>
            <p>informacion@stps.gob.mx</p>
            <p>Tel: 01 800 717 2942</p>
          </div>
          <div className="col-md-4">
            <h5>Descargas</h5>
            <a 
              href="https://www.gob.mx/cms/uploads/attachment/file/480647/NOM-035-STPS-2018.pdf" 
              className="btn btn-outline-light btn-sm mb-2" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Descargar NOM-035
            </a>
            <br />
            <a 
              href="https://www.gob.mx/stps/documentos/guia-de-implementacion-de-la-nom-035-stps-2018" 
              className="btn btn-outline-light btn-sm"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Guía de implementación
            </a>
          </div>
        </div>
        <hr className="my-4 bg-light" />
        <p className="mb-0">&copy; 2023 Información sobre NOM-035. Esta es una página informativa no oficial.</p>
      </div>
    </footer>
  )
}

export default Footer

