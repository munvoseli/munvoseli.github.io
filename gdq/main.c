#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
	int len;
	char* p;
} String;

String emptyString() {
	String s;
	s.len = 0;
	s.p = malloc(1);
	s.p[0] = 0;
	return s;
}

void ccStrn(String* sp, int l, char* s) {
	sp->len += l;
	sp->p = realloc(sp->p, sp->len + 1);
	for (int i = 0; i < l; ++i) {
		sp->p[sp->len - l + i] = s[i];
	}
	sp->p[sp->len] = 0;
}

void ccStrsz(String* sp, char* s) {
	ccStrn(sp, strlen(s), s);
}

void addEvent(int l, char* event, String* tocp, String* bodyp) {
	static int id = 0;
	char a = (id / 10) + 0x30;
	char b = (id % 10) + 0x30;
	++id;
	ccStrsz(tocp, "<li><a href=\"#00");
	tocp->p[tocp->len - 2] = a;
	tocp->p[tocp->len - 1] = b;
	ccStrsz(tocp, "\">");
	ccStrn(tocp, l, event);
	ccStrsz(tocp, "</a></li>");
	ccStrsz(bodyp, "</table><h2 id=\"00");
	bodyp->p[bodyp->len - 2] = a;
	bodyp->p[bodyp->len - 1] = b;
	ccStrsz(bodyp, "\">");
	ccStrn(bodyp, l, event);
	ccStrsz(bodyp, "</h2><table>");
}

int main(int argc, char** argv) {
	if (argc != 3) {
		printf("Requires 2 arguments.\nUsage: ./a.out data.txt index.html\n");
		return 1;
	}
	FILE* fp = fopen(argv[1], "r");
	char* line = NULL;
	size_t len = 0;
	ssize_t nread;
	String body, toc;
	body = emptyString();
	toc = emptyString();
	String links, game, runners, couch, desc;
	long t0, t2, dt;
	char topt;
	char bd;
	char onEmptyLine = 1;
	char blockType; // 0: unspec, 1: run, 2: event
	while ((nread = getline(&line, &len, fp)) != -1) {
		//printf("%s", line);
		if (nread > 2) {
			if (onEmptyLine) {
				links = emptyString();
				game = emptyString();
				runners = emptyString();
				couch = emptyString();
				desc = emptyString();
				topt = 0;
				bd = 2;
				blockType = 0;
			}
			onEmptyLine = 0;
		} else {
			if (!onEmptyLine) {
				if (blockType == 1) {
					ccStrsz(&body, "\n<tr>");
					ccStrsz(&body, "<td>");
					ccStrsz(&body, links.p);
					ccStrsz(&body, "</td>");
					ccStrsz(&body, "<td>");
					ccStrsz(&body, game.p);
					ccStrsz(&body, "</td>");
					ccStrsz(&body, "<td>");
					ccStrsz(&body, runners.p);
					ccStrsz(&body, "</td>");
					ccStrsz(&body, "<td>");
					ccStrsz(&body, couch.p);
					ccStrsz(&body, "</td>");
					ccStrsz(&body, "<td>");
					ccStrsz(&body, desc.p);
					ccStrsz(&body, "</td>");
					ccStrsz(&body, "</tr>");
				}
				free(links.p);
				free(game.p);
				free(runners.p);
				free(couch.p);
				free(desc.p);
			}
			onEmptyLine = 1;
			continue;
		}
		unsigned short sig = (line[0] << 8) | line[1];
		if (line[nread-1] == 10) line[nread-1] = 0;
		switch (sig) {
		case 0x6576:
			addEvent(nread - 4, line + 3, &toc, &body);
			blockType = 2;
			break;
		case 0x676d:
			blockType = 1;
			ccStrsz(&game, line + 3); break;
		case 0x7430:
			blockType = 1;
			t0 = strtol(line + 3, NULL, 10); break;
		case 0x7432:
			blockType = 1;
			t2 = strtol(line + 3, NULL, 10); break;
		case 0x6368:
			blockType = 1;
			if (couch.len > 0)
				ccStrsz(&couch, ", ");
			ccStrsz(&couch, line + 3); break;
		case 0x726e:
			blockType = 1;
			if (runners.len > 0)
				ccStrsz(&runners, ", ");
			ccStrsz(&runners, line + 3); break;
		case 0x6c6e:
			blockType = 1;
			ccStrsz(&links, "<a href=\"");
			ccStrsz(&links, line + 3);
			ccStrsz(&links, "\">link</a>");
			break;
		case 0x6473:
			blockType = 1;
			long l = strtol(line + 3, NULL, 10);
			desc.len = l;
			desc.p = realloc(desc.p, l + 1);
			fread(desc.p, 1, l, fp);
			desc.p[l] = 0;
			fgetc(fp);
			break;
		}
	}
	FILE* ofp = fopen(argv[2], "w");
	fprintf(ofp, "<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"style.css\"/><body><ul>\n");
	fprintf(ofp, "%s\n", toc.p);
	fprintf(ofp, "</ul><table>\n");
	fprintf(ofp, "%s\n", body.p);
	fprintf(ofp, "</table></body></html>\n");
	free(body.p);
	free(toc.p);
	free(line);
	fclose(fp);
	fclose(ofp);
	return 0;
}
