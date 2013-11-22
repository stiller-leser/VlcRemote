using System;
using System.IO;
using System.Net;
using System.Runtime.Serialization;
using System.Text;
using System.Windows.Threading;
using WPCordovaClassLib.Cordova;

namespace WPCordovaClassLib.Cordova.Commands
{
    public class BasicAuth : BaseCommand
    {
        public void get(string options)
        {
            string[] passedData = JSON.JsonHelper.Deserialize<string[]>(options);

            string ip = passedData[0];
            string port = passedData[1];
            string username = passedData[2];
            string password = passedData[3];

            try
            {
                WebClient webClient = new WebClient();
                webClient.DownloadStringCompleted += new DownloadStringCompletedEventHandler(webClient_DownloadStringCompleted);
                string credentials = String.Format("{0}:{1}", username, password);
                byte[] bytes = Encoding.UTF8.GetBytes(credentials);
                string base64 = Convert.ToBase64String(bytes);
                string authorization = String.Concat("Basic ", base64);
                webClient.Headers["Authorization"] = authorization;
                string url = "http://" + ip + ":" + port + "/requests/status.xml";
                var uri = new Uri(url);
                webClient.DownloadStringAsync(uri);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Data);
            }
        }

        void webClient_DownloadStringCompleted(object sender, DownloadStringCompletedEventArgs e)
        {
            try{
                DispatchCommandResult(new PluginResult(PluginResult.Status.OK, e.Result)); //e.Result will fail if the server couldn't be contacted
            } catch{
                DispatchCommandResult(new PluginResult(PluginResult.Status.ERROR, ""));
            }
        }
    }

}