import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, doc, setDoc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import axios from "axios";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import './Dashboard.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [search, setSearch] = useState("");
  const [crypto, setCrypto] = useState(null);
  const [wallet, setWallet] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const carregarCarteira = async () => {
      const user = auth.currentUser;
      if (user) {
        const walletCollection = collection(db, `users/${user.uid}/wallet`);
        const walletSnapshot = await getDocs(walletCollection);
        const walletData = walletSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWallet(walletData);
      }
    };
    carregarCarteira();
  }, []);

  const buscarCriptomoeda = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${search}`
      );
      const data = response.data.market_data;
      setCrypto({
        name: response.data.id,
        current_price: data.current_price.brl,
        high_24h: data.high_24h.brl,
        low_24h: data.low_24h.brl,
        market_cap: data.market_cap.brl,
      });
    } catch (error) {
      console.error("Erro ao buscar criptomoeda: ", error);
    }
  };

  const adicionarNaCarteira = async () => {
    if (!crypto) return;

    const totalValue = crypto.current_price * quantity;
    const walletItem = {
      name: crypto.name || "Desconhecido",
      addedPrice: crypto.current_price || 0,
      amount: quantity || 1,
      totalValue: totalValue || 0,
      currentPrice: crypto.current_price || 0,
      profit: 0,
    };

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Você precisa estar logado para salvar sua carteira.");
        return;
      }

      const walletCollection = collection(db, `users/${user.uid}/wallet`);
      await setDoc(doc(walletCollection, crypto.name), walletItem);

      setWallet([...wallet, walletItem]);
    } catch (error) {
      console.error("Erro ao salvar carteira no Firestore: ", error);
    }
  };

  const removerDaCarteira = async (name) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const walletDoc = doc(db, `users/${user.uid}/wallet`, name);
      await deleteDoc(walletDoc);

      setWallet(wallet.filter((item) => item.name !== name));
    } catch (error) {
      console.error("Erro ao remover criptomoeda: ", error);
    }
  };

  const atualizarRendimentos = async () => {
    try {
      const updatedWallet = await Promise.all(
        wallet.map(async (item) => {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${item.name}`
          );
          const currentPrice = response.data.market_data.current_price.brl;
          const profit = (currentPrice - item.addedPrice) * item.amount;

          const user = auth.currentUser;
          if (user) {
            const walletDoc = doc(db, `users/${user.uid}/wallet`, item.name);
            await updateDoc(walletDoc, { currentPrice, profit });
          }

          return { ...item, currentPrice, profit };
        })
      );

      setWallet(updatedWallet);
      alert("Rendimentos atualizados com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar rendimentos: ", error);
    }
  };

  const calcularResumoGeral = () => {
    const totalInvestido = wallet.reduce((sum, item) => sum + item.addedPrice * item.amount, 0);
    const valorAtual = wallet.reduce((sum, item) => sum + item.currentPrice * item.amount, 0);
    const totalLucro = valorAtual - totalInvestido;
    return { totalInvestido, valorAtual, totalLucro };
  };

  const gerarRelatorioGeralPDF = () => {
    const doc = new jsPDF();
  
    const data = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  
    doc.setFontSize(18);
    doc.text("Relatório Geral da Carteira", 10, 10);
    doc.setFontSize(12);
    doc.text(`Gerado em: ${data}`, 10, 20);
  
    const { totalInvestido, valorAtual, totalLucro } = calcularResumoGeral();
    doc.autoTable({
      startY: 30,
      head: [["Total Investido (BRL)", "Valor Atual (BRL)", "Lucro Total (BRL)"]],
      body: [
        [
          totalInvestido.toLocaleString(),
          valorAtual.toLocaleString(),
          totalLucro.toLocaleString(),
        ],
      ],
    });
  
    doc.text("Detalhes da Carteira:", 10, doc.lastAutoTable.finalY + 10);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Nome", "Preço Adicionado", "Preço Atual", "Quantidade", "Lucro"]],
      body: wallet.map((item) => [
        item.name,
        item.addedPrice.toLocaleString(),
        item.currentPrice.toLocaleString(),
        item.amount.toLocaleString(),
        item.profit.toLocaleString(),
      ]),
    });
  
    doc.save("relatorio_geral_carteira.pdf");
  };

  const gerarRelatorioCriptomoeda = (cryptoName) => {
    const crypto = wallet.find((item) => item.name === cryptoName);
    if (!crypto) return;

    const doc = new jsPDF();
    const data = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    doc.setFontSize(18);
    doc.text(`Relatório de ${cryptoName} - Gerado em: ${data}`, 10, 10);

    doc.autoTable({
      head: [["Nome", "Preço Adicionado", "Preço Atual", "Quantidade", "Lucro"]],
      body: [[
        crypto.name,
        crypto.addedPrice.toLocaleString(),
        crypto.currentPrice.toLocaleString(),
        crypto.amount,
        crypto.profit.toLocaleString(),
      ]],
    });

    doc.save(`${cryptoName}_relatorio.pdf`);
  };

  const { totalInvestido, valorAtual, totalLucro } = calcularResumoGeral();

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Pesquisar Criptomoeda (ex.: bitcoin)"
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
        <button onClick={buscarCriptomoeda}>Pesquisar</button>
      </div>
      {crypto && (
        <div className="crypto-details">
          <h3>{crypto.name}</h3>
          <p>Preço Atual: {crypto.current_price.toLocaleString()} BRL</p>
          <p>Alta 24h: {crypto.high_24h.toLocaleString()} BRL</p>
          <p>Baixa 24h: {crypto.low_24h.toLocaleString()} BRL</p>
          <p>Valor de Mercado: {crypto.market_cap.toLocaleString()} BRL</p>
          <div>
            <label htmlFor="quantity">Quantidade:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              min="1"
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          <p>Valor Total: {(crypto.current_price * quantity).toLocaleString()} BRL</p>
          <button onClick={adicionarNaCarteira}>Adicionar à Carteira</button>
        </div>
      )}
      <h2>Resumo Geral</h2>
      <div className="summary">
        <p>Total Investido: {totalInvestido.toLocaleString()} BRL</p>
        <p>Valor Atual: {valorAtual.toLocaleString()} BRL</p>
        <p>Lucro Total: {totalLucro.toLocaleString()} BRL</p>
      </div>
      <button onClick={gerarRelatorioGeralPDF}>Gerar Relatório Geral (PDF)</button>
      <h2>Carteira</h2>
      <button onClick={atualizarRendimentos}>Atualizar Rendimentos</button>
      <div className="wallet-list">
        {wallet.length > 0 ? (
          wallet.map((item, index) => (
            <div className="wallet-card" key={index}>
              <p>
                <strong>{item.name}</strong>: {item.amount} unidades
                <br />
                Preço Adicionado: {item.addedPrice.toLocaleString()} BRL
                <br />
                Valor Investido Total: {(item.addedPrice * item.amount).toLocaleString()} BRL
                <br />
                Preço Atual: {item.currentPrice.toLocaleString()} BRL
                <br />
                Lucro:{" "}
                <span style={{ color: item.profit >= 0 ? "green" : "red" }}>
                  {item.profit.toLocaleString()} BRL
                </span>
              </p>
              <button className="remove-button" onClick={() => removerDaCarteira(item.name)}>
                Remover
              </button>
              <button onClick={() => gerarRelatorioCriptomoeda(item.name)}>
                Gerar Relatório (PDF)
              </button>
            </div>
          ))
        ) : (
          <p>Sem itens na carteira</p>
        )}
      </div>
      <h2>Gráfico de Performance</h2>
      {wallet.length > 0 && (
        <div className="chart-container">
          <Pie
            data={{
              labels: wallet.map((item) => item.name),
              datasets: [
                {
                  label: "Valor Atual (BRL)",
                  data: wallet.map((item) => item.currentPrice * item.amount),
                  backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
                },
              ],
            }}
          />
        </div>
      )}
      <button className="logout-button" onClick={() => signOut(auth)}>Logout</button>
    </div>
  );
}

export default Dashboard;
