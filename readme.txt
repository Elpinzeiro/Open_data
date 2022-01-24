Requisiti:
avere un'installazione di Tomcat su cui caricare la web application Biblioteche.

Step 1)
Caricare su Tomcat la webapp Biblioteche (che si trova nella cartella EndPoint) in questo modo:
- copiare il file compresso "Biblioteche.war" all'interno della cartella "webapps" di Tomcat.
	oppure
- copiare la cartella Biblioteche nella cartella "webapps" di Tomcat.
(La cartella webapps è sotto la cartella root di Tomcat)

Step 2)
Lanciare Tomcat (da prompt Windows):
- Posizionarsi nella cartella root di Tomcat
- entrare poi nella cartella bin
- lanciare il file startup
(comando: percorso_cartella_root_Tomcat/bin/startup)

Per controllare che Tomcat sia attivo provare a lanciare da browser localhost:8080, si presenterà la pagina di Tomcat

Step 3)
Lanciare la pagina web index.html, all'interno della cartella SitoWeb/OpenData.
