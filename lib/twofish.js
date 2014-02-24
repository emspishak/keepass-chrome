/* Based on org.bouncycastle.crypto.engines.TwofishEngine
 * originally licensed under these terms:
 *
 * Copyright (c) 2000 - 2012 The Legion Of The Bouncy Castle
 * (http://www.bouncycastle.org)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function(){var z=CryptoJS,A=z.lib.BlockCipher,c=[[169,103,179,232,4,253,163,118,154,146,128,120,228,221,209,56,13,198,53,152,24,247,236,108,67,117,55,38,250,19,148,72,242,208,139,48,132,84,223,35,25,91,61,89,243,174,162,130,99,1,131,46,217,81,155,124,166,235,165,190,22,12,227,97,192,140,58,245,115,44,37,11,187,78,137,107,83,106,180,241,225,230,189,69,226,244,182,102,204,149,3,86,212,28,30,215,251,195,142,181,233,207,191,186,234,119,57,175,51,201,98,113,129,121,9,173,36,205,249,216,229,197,185,77,
68,8,134,231,161,29,170,237,6,112,178,210,65,123,160,17,49,194,39,144,32,246,96,255,150,92,177,171,158,156,82,27,95,147,10,239,145,133,73,238,45,79,143,59,71,135,109,70,214,62,105,100,42,206,203,47,252,151,5,122,172,127,213,26,75,14,167,90,40,20,63,41,136,60,76,2,184,218,176,23,85,31,138,125,87,199,141,116,183,196,159,114,126,21,34,18,88,7,153,52,110,80,222,104,101,188,219,248,200,168,43,64,220,254,50,164,202,16,33,240,211,93,15,0,111,157,54,66,74,94,193,224],[117,243,198,244,219,123,251,200,74,211,
230,107,69,125,232,75,214,50,216,253,55,113,241,225,48,15,248,27,135,250,6,63,94,186,174,91,138,0,188,157,109,193,177,14,128,93,210,213,160,132,7,20,181,144,44,163,178,115,76,84,146,116,54,81,56,176,189,90,252,96,98,150,108,66,247,16,124,40,39,140,19,149,156,199,36,70,59,112,202,227,133,203,17,208,147,184,166,131,32,255,159,119,195,204,3,111,8,191,64,231,43,226,121,12,170,130,65,58,234,185,228,154,164,151,126,218,122,23,102,148,161,29,61,240,222,179,11,114,167,28,239,209,83,62,143,51,38,95,236,118,
42,73,129,136,238,33,196,26,235,217,197,57,153,205,173,49,139,1,24,35,221,31,78,45,249,72,79,242,101,142,120,92,88,25,141,229,152,87,103,127,5,100,175,99,182,254,245,183,60,165,206,233,104,68,224,77,67,105,41,46,172,21,89,168,10,158,110,71,223,52,53,106,207,220,34,201,192,155,137,212,237,171,18,162,13,82,187,2,47,169,215,97,30,180,80,4,246,194,22,37,134,86,85,9,190,145]],s=[],t=[],u=[],v=[],l=[],m=[],r=0,a=function(d,a){return d>>>8*a&255},p=function(d){return(d&255)<<24|(d>>8&255)<<16|(d>>16&255)<<
8|d>>24&255},w=function(d){return d>>2^(0!==(d&2)?180.5:0)^(0!==(d&1)?90.25:0)},B=function(d){var a=d>>>24&255,c=(a<<1^(0!==(a&128)?333:0))&255,b=a>>>1^(0!==(a&1)?166:0)^c;return d<<8^b<<24^c<<16^b<<8^a},C=function(d,q){var n=a(d,0),b=a(d,1),g=a(d,2),f=a(d,3),h=q[0],e=q[1],k=q[2],l=q[3],p=0;switch(r&3){case 1:p=s[c[0][n]&255^a(h,0)]^t[c[0][b]&255^a(h,1)]^u[c[1][g]&255^a(h,2)]^v[c[1][f]&255^a(h,3)];break;case 0:n=c[1][n]&255^a(l,0),b=c[0][b]&255^a(l,1),g=c[0][g]&255^a(l,2),f=c[1][f]&255^a(l,3);case 3:n=
c[1][n]&255^a(k,0),b=c[1][b]&255^a(k,1),g=c[0][g]&255^a(k,2),f=c[0][f]&255^a(k,3);case 2:p=s[c[0][c[0][n]&255^a(e,0)]&255^a(h,0)]^t[c[0][c[1][b]&255^a(e,1)]&255^a(h,1)]^u[c[1][c[0][g]&255^a(e,2)]&255^a(h,2)]^v[c[1][c[1][f]&255^a(e,3)]&255^a(h,3)]}return p},x=function(d){return m[0+2*(d&255)]^m[1+2*(d>>>8&255)]^m[512+2*(d>>>16&255)]^m[513+2*(d>>>24&255)]},y=function(d){return m[0+2*(d>>>24&255)]^m[1+2*(d&255)]^m[512+2*(d>>>8&255)]^m[513+2*(d>>>16&255)]},D=z.algo.TwoFish=A.extend({_doReset:function(){var d=
[],q=[],n=[],b,g,f,h,e,k;g=[];f=[];h=[];r=this._key.sigBytes/8;for(b=0;256>b;b+=1)e=c[0][b]&255,g[0]=e,f[0]=(e^w(e))&255,h[0]=(e^e>>1^(0!==(e&1)?180.5:0)^w(e))&255,e=c[1][b]&255,g[1]=e,f[1]=(e^w(e))&255,h[1]=(e^e>>1^(0!==(e&1)?180.5:0)^w(e))&255,s[b]=g[1]|f[1]<<8|h[1]<<16|h[1]<<24,t[b]=h[0]|h[0]<<8|f[0]<<16|g[0]<<24,u[b]=f[1]|h[1]<<8|g[1]<<16|h[1]<<24,v[b]=f[0]|g[0]<<8|h[0]<<16|f[0]<<24;if(1>r)throw"Key size less than 64 bits";if(4<r)throw"Key size larger than 256 bits";for(b=0;b<r;b++){g=2*b;d[b]=
p(this._key.words[g]);q[b]=p(this._key.words[g+1]);g=n;f=r-1-b;h=d[b];e=q[b];k=void 0;for(k=0;4>k;k+=1)e=B(e);e^=h;for(k=0;4>k;k+=1)e=B(e);g[f]=e}for(b=0;20>b;b++)f=33686018*b,g=C(f,d),f=C(f+16843009,q),f=f<<8|f>>>24,g+=f,l[2*b]=g,g+=f,l[2*b+1]=g<<9|g>>>23;d=n[0];q=n[1];g=n[2];n=n[3];m=[];for(b=0;256>b;b++)switch(f=h=e=k=b,r&3){case 1:m[2*b]=s[c[0][f]&255^a(d,0)];m[2*b+1]=t[c[0][h]&255^a(d,1)];m[2*b+512]=u[c[1][e]&255^a(d,2)];m[2*b+513]=v[c[1][k]&255^a(d,3)];break;case 0:f=c[1][f]&255^a(n,0),h=c[0][h]&
255^a(n,1),e=c[0][e]&255^a(n,2),k=c[1][k]&255^a(n,3);case 3:f=c[1][f]&255^a(g,0),h=c[1][h]&255^a(g,1),e=c[0][e]&255^a(g,2),k=c[0][k]&255^a(g,3);case 2:m[2*b]=s[c[0][c[0][f]&255^a(q,0)]&255^a(d,0)],m[2*b+1]=t[c[0][c[1][h]&255^a(q,1)]&255^a(d,1)],m[2*b+512]=u[c[1][c[0][e]&255^a(q,2)]&255^a(d,2)],m[2*b+513]=v[c[1][c[1][k]&255^a(q,3)]&255^a(d,3)]}},decryptBlock:function(d,a){var c=p(d[a])^l[4],b=p(d[a+1])^l[5],g=p(d[a+2])^l[6],f=p(d[a+3])^l[7],h=39,e,k,m;for(m=0;16>m;m+=2)e=x(c),k=y(b),f^=e+2*k+l[h--],
g=(g<<1|g>>>31)^e+k+l[h--],f=f>>>1|f<<31,e=x(g),k=y(f),b^=e+2*k+l[h--],c=(c<<1|c>>>31)^e+k+l[h--],b=b>>>1|b<<31;d[a]=p(g^l[0]);d[a+1]=p(f^l[1]);d[a+2]=p(c^l[2]);d[a+3]=p(b^l[3])},encryptBlock:function(a,c){var n=p(a[c])^l[0],b=p(a[c+1])^l[1],g=p(a[c+2])^l[2],f=p(a[c+3])^l[3],h=8,e,k,m;for(m=0;16>m;m+=2)e=x(n),k=y(b),g^=e+k+l[h++],g=g>>>1|g<<31,f=(f<<1|f>>>31)^e+2*k+l[h++],e=x(g),k=y(f),n^=e+k+l[h++],n=n>>>1|n<<31,b=(b<<1|b>>>31)^e+2*k+l[h++];a[c]=p(g^l[4]);a[c+1]=p(f^l[5]);a[c+2]=p(n^l[6]);a[c+3]=
p(b^l[7])}});z.TwoFish=A._createHelper(D)})();