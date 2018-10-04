using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace WPF
{
    /// <summary>
    /// Interaction logic for Box.xaml
    /// </summary>
    public partial class Box : UserControl
    {
        public int Row = 0;
        public int Col = 0;
        Func<int, int, bool> switchFunction;
        public Box(int row, int col, Func<int, int, bool> switchFunction)
        {
            this.Row = row;
            this.Col = col;
            this.switchFunction = switchFunction;
            InitializeComponent();
        }
        public void UpdateColor(Color color)
        {
            rec.Fill = new SolidColorBrush(color);
        }
        private void rec_Click(object sender, RoutedEventArgs e)
        {
            switchFunction(Row, Col);
        }
        public void UpdateVisState(Visibility vis)
        {
            this.rec.Visibility = vis;
        }

    }
}
